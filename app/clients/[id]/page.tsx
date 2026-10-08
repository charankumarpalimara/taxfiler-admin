'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ClientDetailsScreen from '@/components/ClientDetailsScreen';
import { Client, ApiResponse } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ClientDynamicDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch full details
      const res = await fetch(`/api/clients?id=${id}&full=true`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.client) {
          setClient(json.data.client);
        } else if (json.data.user) {
          // Construct client from user profile
          const u = json.data.user;
          setClient({
            id: u.id || id,
            clientName: u.fullName || 'Client Profile',
            companyName: u.accountType === 'Corporate' ? u.fullName : 'Individual',
            email: u.email || '',
            phone: u.phone || '',
            clientType: u.accountType || 'Individual',
            assignedCPA: u.assignedCPA || 'David Miller, CPA',
            taxYear: '2025',
            status: u.portalStatus || 'Active',
            filingStatus: u.filingStatus || 'Documents Uploaded',
            totalFilings: 1,
            notes: u.notes || '',
            createdAt: u.createdAt || new Date().toISOString(),
          });
        }
      } else {
        // Fallback: search in clients list
        const listRes = await fetch('/api/clients');
        const listJson: ApiResponse<Client[]> = await listRes.json();
        if (listJson.success && listJson.data) {
          const found = listJson.data.find((c) => c.id === id);
          if (found) {
            setClient(found);
          } else {
            setError(`Client with ID "${id}" was not found.`);
          }
        } else {
          setError(`Client with ID "${id}" was not found.`);
        }
      }
    } catch (err: any) {
      console.error('Error fetching client details:', err);
      setError('Failed to load client details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleUpdateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, ...updates }),
      });
      const data: ApiResponse<Client> = await res.json();
      if (data.success && data.data) {
        setClient(data.data);
      }
    } catch (err) {
      console.error('Error updating client:', err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await fetch(`/api/clients?id=${clientId}`, { method: 'DELETE' });
      router.push('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  return (
    <AdminLayout
      title={client ? `Client: ${client.clientName}` : 'Client Details'}
      onRefresh={fetchClient}
      isRefreshing={loading}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs font-bold text-text-light">Loading client details...</p>
        </div>
      ) : error || !client ? (
        <div className="bg-white rounded-3xl p-10 border border-border-subtle text-center space-y-4 max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-text-dark font-heading">Client Not Found</h2>
          <p className="text-xs text-text-light">{error || 'The requested client could not be located in the directory.'}</p>
          <button
            onClick={() => router.push('/clients')}
            type="button"
            className="px-5 py-2.5 btn-brand-primary text-xs shadow-md shadow-brand-primary/20 cursor-pointer"
          >
            Return to Clients Directory
          </button>
        </div>
      ) : (
        <ClientDetailsScreen
          client={client}
          onBack={() => router.push('/clients')}
          onUpdate={handleUpdateClient}
          onDelete={handleDeleteClient}
        />
      )}
    </AdminLayout>
  );
}
