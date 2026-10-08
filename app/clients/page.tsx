'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { Column } from '@/components/DataTable';
import NewClientModal from '@/components/NewClientModal';
import { Client, ClientStatus, ClientType, ApiResponse } from '@/types';
import { Download, Trash2, UserPlus, Users, Building, CheckCircle2, Clock, Eye, Briefcase } from 'lucide-react';

const STATUS_FILTERS: string[] = ['All', 'Active', 'Onboarding', 'Filing Pending', 'Completed', 'Inactive'];

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('All');

  const fetchClients = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/clients');
      const data: ApiResponse<Client[]> = await res.json();
      if (data.success && data.data) {
        setClients(data.data);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Update status handler
  const handleUpdateStatus = async (id: string, status: ClientStatus) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data: ApiResponse<Client> = await res.json();
      if (data.success) {
        setClients((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error('Error updating client status:', err);
    }
  };

  // Delete client handler
  const handleDeleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<boolean> = await res.json();
      if (data.success) {
        setClients((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Add client handler
  const handleAddClient = async (newClient: Partial<Client>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      const data: ApiResponse<Client> = await res.json();
      if (data.success && data.data) {
        setClients((prev) => [data.data!, ...prev]);
      }
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  // CSV Export handler
  const handleExportCSV = (exportItems?: Client[]) => {
    const items = exportItems && exportItems.length > 0 ? exportItems : clients;
    if (!items || items.length === 0) {
      alert('No client records to export');
      return;
    }
    const headers = [
      'Client ID',
      'Client Name',
      'Company Name',
      'Email',
      'Phone',
      'Client Type',
      'Assigned CPA',
      'Tax Year',
      'Filing Status',
      'Total Filings',
      'Last Filing Date',
      'Notes',
      'Created At',
    ];
    const rows = exportItems.map((c) => [
      `"${c.id || ''}"`,
      `"${c.clientName || ''}"`,
      `"${c.companyName || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.clientType || ''}"`,
      `"${c.assignedCPA || ''}"`,
      `"${c.taxYear || ''}"`,
      `"${c.status || ''}"`,
      `"${c.totalFilings || 0}"`,
      `"${c.lastFilingDate || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${c.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgen_clients_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Styling Helper
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
      case 'Onboarding':
        return 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100';
      case 'Filing Pending':
        return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
      case 'Completed':
        return 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100';
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Client Type Badge Styling Helper
  const getTypeBadgeClass = (type?: string) => {
    switch (type) {
      case 'Corporate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Individual':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Partnership':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Small Business':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Computed summary metrics
  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'Active').length;
    const corporate = clients.filter((c) => c.clientType === 'Corporate' || c.clientType === 'Small Business').length;
    const pendingFiling = clients.filter((c) => c.status === 'Filing Pending' || c.status === 'Onboarding').length;
    return { total, active, corporate, pendingFiling };
  }, [clients]);

  // Table Columns Definition
  const columns: Column<Client>[] = [
    {
      key: 'clientName',
      header: 'Client & Entity',
      cell: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
            {client.clientName?.[0] || 'C'}
          </div>
          <div>
            <div className="font-bold text-slate-900 font-heading text-xs flex items-center gap-1.5">
              <span>{client.clientName}</span>
              <span className="text-[10px] text-slate-400 font-normal">({client.id})</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
              {client.companyName || 'Individual Tax Return'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'clientType',
      header: 'Entity Type',
      cell: (client) => (
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getTypeBadgeClass(client.clientType)}`}>
          {client.clientType}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Contact Information',
      cell: (client) => (
        <div className="space-y-0.5 text-[11px]">
          <a href={`mailto:${client.email}`} className="block text-slate-700 hover:text-brand-primary hover:underline truncate max-w-[190px]">
            {client.email}
          </a>
          {client.phone && (
            <a href={`tel:${client.phone}`} className="block text-slate-500 hover:text-emerald-600">
              {client.phone}
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'assignedCPA',
      header: 'Assigned Lead CPA',
      cell: (client) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-800">
          <Briefcase className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span className="font-medium text-[11px]">{client.assignedCPA || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'taxYear',
      header: 'Tax Year / Filings',
      cell: (client) => (
        <div>
          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
            {client.taxYear}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">
            {client.totalFilings} return{client.totalFilings === 1 ? '' : 's'} filed
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Filing Status',
      cell: (client) => (
        <select
          value={client.status || 'Active'}
          onChange={(e) => handleUpdateStatus(client.id, e.target.value as ClientStatus)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${getStatusBadgeClass(
            client.status
          )}`}
        >
          <option value="Active">Active</option>
          <option value="Onboarding">Onboarding</option>
          <option value="Filing Pending">Filing Pending</option>
          <option value="Completed">Completed</option>
          <option value="Inactive">Inactive</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (client) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/clients/${client.id}`)}
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-primary transition-colors cursor-pointer"
            title="View Client Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete client record for ${client.clientName}?`)) {
                handleDeleteClient(client.id);
              }
            }}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Tax Clients Directory"
      onRefresh={fetchClients}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-2">
        {/* Consolidated Metric Banner Card */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 lg:p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:gap-x-8 sm:gap-y-6 lg:gap-y-0 lg:divide-x divide-slate-100">
            <div className="flex items-center justify-between lg:pr-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clients</p>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1">{metrics.total}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Active CPA Directory</p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:px-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Clients</p>
                <h3 className="text-2xl lg:text-3xl font-black text-emerald-600 mt-1">{metrics.active}</h3>
                <p className="text-[11px] text-emerald-600/80 mt-0.5">In good standing</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:px-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business / Corporate</p>
                <h3 className="text-2xl lg:text-3xl font-black text-indigo-600 mt-1">{metrics.corporate}</h3>
                <p className="text-[11px] text-indigo-600/80 mt-0.5">Corporate & LLCs</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shrink-0">
                <Building className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:pl-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filings Pending</p>
                <h3 className="text-2xl lg:text-3xl font-black text-amber-600 mt-1">{metrics.pendingFiling}</h3>
                <p className="text-[11px] text-amber-600/80 mt-0.5">Requires tax preparation</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Client Directory Header Card */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                  NexGen Client Accounts
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Comprehensive management of individual and corporate tax clients, assigned CPAs, and filing statuses.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={() => handleExportCSV(clients)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-brand-primary text-xs shadow-md shadow-brand-primary/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add New Client
            </button>
          </div>
        </div>

        {/* Dynamic DataTable */}
        <DataTable
          data={clients}
          columns={columns}
          getRowId={(client) => client.id}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
          searchKeys={['clientName', 'companyName', 'email', 'phone', 'assignedCPA', 'id']}
          filterKey="status"
          statusOptions={STATUS_FILTERS}
          customFilterFn={(client) => {
            if (clientTypeFilter === 'All') return true;
            return client.clientType?.toLowerCase() === clientTypeFilter.toLowerCase();
          }}
          searchPlaceholder="Search clients by name, company, email, phone, CPA..."
          filterLabel="Status Filter:"
          enablePagination={true}
          defaultPageSize={10}
          emptyMessage="No clients found"
          emptySubtext="Try adjusting your search terms or entity type filter."
          footerLabel="NexGen CPA Clients Engine"
        />

        {/* New Client Modal */}
        {showNewModal && (
          <NewClientModal
            onClose={() => setShowNewModal(false)}
            onAdd={handleAddClient}
          />
        )}
      </div>
    </AdminLayout>
  );
}
