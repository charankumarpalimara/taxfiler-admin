'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { Column } from '@/components/DataTable';
import NewRegistrationModal from '@/components/NewRegistrationModal';
import { Registration, PortalStatus, ApiResponse } from '@/types';
import { Download, Trash2, UserPlus, UserCheck } from 'lucide-react';

const STATUS_FILTERS: string[] = ['All', 'Verified', 'Pending Review', 'Active'];

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchRegistrations = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/registrations');
      const data: ApiResponse<Registration[]> = await res.json();
      if (data.success && data.data) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (id: string, status: PortalStatus) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data: ApiResponse<Registration> = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((item) => (item.id === id ? { ...item, portalStatus: status } : item))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    try {
      const res = await fetch(`/api/registrations?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<boolean> = await res.json();
      if (data.success) {
        setRegistrations((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
    }
  };

  const handleAddRegistration = async (newItem: Partial<Registration>) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data: ApiResponse<Registration> = await res.json();
      if (data.success && data.data) {
        setRegistrations((prev) => [data.data!, ...prev]);
      }
    } catch (err) {
      console.error('Error adding registration:', err);
    }
  };

  // Dynamic Export CSV handler
  const handleExportCSV = (exportItems?: Registration[]) => {
    const items = exportItems && exportItems.length > 0 ? exportItems : registrations;
    if (!items || items.length === 0) {
      alert('No registrations to export');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Portal Status', 'Account Type', 'Created At'];
    const rows = items.map((r) => [
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

  // Define table columns
  const columns: Column<Registration>[] = [
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
          onChange={(e) => handleUpdateStatus(reg.id, e.target.value as PortalStatus)}
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
              handleDeleteRegistration(reg.id);
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
    <AdminLayout 
      title="Client Portal Registrations" 
      onRefresh={fetchRegistrations} 
      isRefreshing={isRefreshing}
    >
      <div className="space-y-2">
        {/* Registrations Directory Header Card */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                  Registered Client Accounts
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Clients who registered through the portal modal on the website.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={() => handleExportCSV(registrations)}
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
              <UserPlus className="w-3.5 h-3.5" /> Register Client
            </button>
          </div>
        </div>

        {/* Fully Dynamic DataTable */}
        <DataTable
          data={registrations}
          columns={columns}
          getRowId={(reg) => reg.id}
          searchKeys={['fullName', 'email', 'phone']}
          filterKey="portalStatus"
          statusOptions={STATUS_FILTERS}
          searchPlaceholder="Search registered clients by name, email, or phone..."
          filterLabel="Account Status:"
          enablePagination={true}
          defaultPageSize={10}
          emptyMessage="No registered clients found"
          emptySubtext="Try adjusting your search query or status filter."
          footerLabel="NexGen Portal Accounts Engine"
        />
      </div>

      {showNewModal && (
        <NewRegistrationModal
          onClose={() => setShowNewModal(false)}
          onAdd={handleAddRegistration}
        />
      )}
    </AdminLayout>
  );
}
