'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Building, Mail, Phone, Calendar, UserCheck, FileText, CheckCircle2,
  Tag, Download, ExternalLink, ShieldCheck, CreditCard, Home, Users,
  Sparkles, Loader2, Save, AlertCircle, Eye, Trash2, ChevronRight, Briefcase
} from 'lucide-react';
import { Client, ClientStatus, ClientType, UserFullDetails, UserDocument } from '@/types';
import { API_BASE_URL } from '@/services/api.config';

export interface ClientDetailsScreenProps {
  client: Client;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Client>) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
}

const FILING_STATUS_STEPS = [
  'Not Started',
  'Documents Uploaded',
  'Under Review & Estimation',
  'Tax Draft Prepared',
  'Client Review & Approval',
  'Filed with IRS',
  'Accepted by IRS / Refund Issued',
];

export default function ClientDetailsScreen({
  client,
  onBack,
  onUpdate,
  onDelete,
}: ClientDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'taxpayer' | 'dependents' | 'address' | 'identity_bank' | 'documents'>('overview');
  const [fullDetails, setFullDetails] = useState<UserFullDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    clientName: client.clientName,
    companyName: client.companyName || '',
    email: client.email,
    phone: client.phone,
    clientType: client.clientType,
    assignedCPA: client.assignedCPA || 'David Miller, CPA',
    taxYear: client.taxYear || '2025',
    status: client.status,
    filingStatus: client.filingStatus || 'Documents Uploaded',
    notes: client.notes || '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [docActionLoading, setDocActionLoading] = useState<string | null>(null);

  // Sync formData if incoming client prop changes
  useEffect(() => {
    setFormData({
      clientName: client.clientName,
      companyName: client.companyName || '',
      email: client.email,
      phone: client.phone,
      clientType: client.clientType,
      assignedCPA: client.assignedCPA || 'David Miller, CPA',
      taxYear: client.taxYear || '2025',
      status: client.status,
      filingStatus: client.filingStatus || 'Documents Uploaded',
      notes: client.notes || '',
    });
  }, [client]);

  // Fetch complete client profile information from backend
  useEffect(() => {
    let isMounted = true;
    const loadFullDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/clients?id=${client.id}&full=true`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setFullDetails(json.data);
          if (json.data.user) {
            setFormData((prev) => ({
              ...prev,
              clientName: json.data.user.fullName || prev.clientName,
              email: json.data.user.email || prev.email,
              phone: json.data.user.phone || prev.phone,
              filingStatus: json.data.user.filingStatus || prev.filingStatus,
              status: json.data.user.portalStatus || prev.status,
              assignedCPA: json.data.user.assignedCPA || prev.assignedCPA,
              notes: json.data.user.notes || prev.notes,
            }));
          }
        }
      } catch (err) {
        console.warn('Error loading full client profile details:', err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadFullDetails();
    return () => {
      isMounted = false;
    };
  }, [client.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(client.id, formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentStatusChange = async (docId: string, newStatus: 'Pending Review' | 'Approved' | 'Rejected') => {
    setDocActionLoading(docId);
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success && fullDetails?.documents) {
        setFullDetails({
          ...fullDetails,
          documents: fullDetails.documents.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)),
        });
      }
    } catch (err) {
      console.error('Failed to update document status:', err);
    } finally {
      setDocActionLoading(null);
    }
  };

  const getDownloadUrl = (path?: string) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Status', icon: FileText },
    { id: 'taxpayer', label: 'Taxpayer & Spouse', icon: UserCheck },
    { id: 'dependents', label: `Dependents (${fullDetails?.dependents?.length || 0})`, icon: Sparkles },
    { id: 'address', label: 'Address & Contact', icon: Home },
    { id: 'identity_bank', label: 'Identity & Bank', icon: CreditCard },
    { id: 'documents', label: `Documents (${fullDetails?.documents?.length || 0})`, icon: Download },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-border-subtle shadow-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Clients Directory</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-text-light font-medium">
            <span>Clients</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-text-dark">{formData.clientName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-bg-subtle text-text-mid font-mono font-bold">
              {client.id}
            </span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to permanently delete the client record for ${client.clientName}?`)) {
                onDelete(client.id);
                onBack();
              }
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Client</span>
          </button>
        )}
      </div>

      {/* Main Hero Card Banner */}
      <div className="bg-white rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-6 sm:px-8 sm:py-7 bg-gradient-to-r from-brand-blue-dark via-brand-primary to-brand-secondary text-white relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-gold-light font-black text-2xl border border-white/20 shrink-0 shadow-inner">
                {formData.clientName?.[0] || 'C'}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-extrabold text-xl sm:text-2xl font-heading text-white tracking-tight">
                    {formData.clientName}
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/20 text-white border border-white/30 font-mono">
                    {client.id}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-brand-accent/25 text-brand-gold-light border border-brand-accent/40">
                    {formData.clientType}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {formData.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="font-medium text-white">{formData.companyName || 'Individual Tax Return'}</span>
                  <span>&bull;</span>
                  <a href={`mailto:${formData.email}`} className="hover:text-brand-gold-light underline underline-offset-2">
                    {formData.email}
                  </a>
                  <span>&bull;</span>
                  <a href={`tel:${formData.phone}`} className="hover:text-brand-gold-light">
                    {formData.phone}
                  </a>
                  <span>&bull;</span>
                  <span>Tax Year <strong className="text-white">{formData.taxYear}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill in Banner */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">IRS Tax Filing Step</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-brand-accent text-brand-blue-dark font-extrabold text-xs shadow-md">
                {formData.filingStatus}
              </span>
              <span className="text-[11px] text-slate-300">
                Assigned: <strong className="text-white">{formData.assignedCPA}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="px-6 sm:px-8 pt-3 pb-2.5 border-b border-border-subtle bg-bg-light flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm border border-brand-primary'
                    : 'text-text-mid hover:text-text-dark hover:bg-bg-subtle border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-gold-light' : 'text-text-light'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold text-xs">Client record and tax filing details saved successfully!</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Filing Status Workflow Progress Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-primary/5 to-brand-secondary/10 border border-border-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-brand-primary tracking-wider font-heading">
                      IRS Tax Filing Progression Pipeline
                    </h3>
                    <p className="text-xs text-text-mid mt-0.5">
                      Advance client return status through IRS documentation, CPA preparation, and e-filing stages.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-brand-primary text-white font-extrabold text-xs shadow-xs self-start sm:self-auto">
                    {formData.filingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-text-dark block mb-1.5">Tax Filing Step</label>
                    <select
                      value={formData.filingStatus}
                      onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-bold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
                    >
                      {FILING_STATUS_STEPS.map((step) => (
                        <option key={step} value={step}>{step}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-dark block mb-1.5">Portal Account Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Filing Pending">Filing Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Client Full Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Company / Entity Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp LLC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Entity Type</label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Small Business">Small Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Assigned CPA Specialist</label>
                  <input
                    type="text"
                    value={formData.assignedCPA}
                    onChange={(e) => setFormData({ ...formData, assignedCPA: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white font-semibold text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Staff CPA Notes */}
              <div>
                <label className="text-xs font-bold text-text-dark block mb-1">
                  CPA Staff Internal Notes & Tax Return Comments
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add internal notes regarding this client's documents, deductions, Schedule C, IRS correspondence, Zoom meetings..."
                  className="w-full p-3.5 rounded-2xl border border-border-subtle bg-bg-light focus:bg-white font-medium text-xs text-text-dark focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <span className="text-xs text-text-light">
                  Last updated {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : 'recently'}
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 btn-brand-primary text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-brand-primary/25 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Client Updates</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TAXPAYER & SPOUSE */}
          {activeTab === 'taxpayer' && (
            <div className="space-y-6">
              {/* Primary Taxpayer */}
              <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-4">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-2 font-heading">
                  <UserCheck className="w-4 h-4 text-brand-accent" /> Primary Taxpayer Profile
                </h3>
                {fullDetails?.taxpayer ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {`${fullDetails.taxpayer.firstName || ''} ${fullDetails.taxpayer.middleName || ''} ${fullDetails.taxpayer.lastName || ''}`.trim() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">SSN / ITIN</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{fullDetails.taxpayer.ssn || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Date of Birth</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.taxpayer.dob || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Filing Status</span>
                      <span className="font-bold text-brand-secondary text-xs">{fullDetails.taxpayer.filingStatus || 'Single'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Occupation</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.taxpayer.occupation || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">User has not submitted primary taxpayer personal details yet.</p>
                )}
              </div>

              {/* Spouse Details */}
              <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-4">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-2 font-heading">
                  <Users className="w-4 h-4 text-brand-accent" /> Spouse Personal Details
                </h3>
                {fullDetails?.spouse && fullDetails.spouse.firstName ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Spouse Name</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {`${fullDetails.spouse.firstName || ''} ${fullDetails.spouse.middleName || ''} ${fullDetails.spouse.lastName || ''}`.trim()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Spouse SSN</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{fullDetails.spouse.ssn || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Spouse DOB</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.spouse.dob || 'Not provided'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No spouse details recorded for this account.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPENDENTS */}
          {activeTab === 'dependents' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider font-heading">Claimed Dependents</h3>
              {fullDetails?.dependents && fullDetails.dependents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fullDetails.dependents.map((dep, idx) => (
                    <div key={dep.id || dep._id || idx} className="p-4 rounded-2xl bg-bg-light border border-border-subtle space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-primary text-xs">
                          {dep.name || `${dep.firstName || ''} ${dep.lastName || ''}`.trim() || `Dependent #${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full badge-primary">
                          {dep.relationship || 'Child'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block">SSN:</span>
                          <span className="font-mono font-bold text-slate-900">{dep.ssn || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Date of Birth:</span>
                          <span className="font-bold text-slate-900">{dep.dob || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-bg-light rounded-2xl border border-dashed border-border-subtle">
                  <p className="text-xs text-slate-400 italic">No dependents claimed by this client.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESS & CONTACT */}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-2">
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider font-heading">Current Residential Address</h3>
                  {fullDetails?.address?.currentAddress ? (
                    <div className="space-y-1 text-slate-700 text-xs">
                      <p className="font-bold text-slate-900">{fullDetails.address.currentAddress.street || 'Street not set'}</p>
                      <p>
                        {fullDetails.address.currentAddress.city || ''}, {fullDetails.address.currentAddress.state || ''} {fullDetails.address.currentAddress.zipCode || ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No current address entered.</p>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-2">
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider font-heading">Tax Year 2024 Filing Address</h3>
                  {fullDetails?.address?.taxYearAddress ? (
                    <div className="space-y-1 text-slate-700 text-xs">
                      <p className="font-bold text-slate-900">{fullDetails.address.taxYearAddress.street || 'Street not set'}</p>
                      <p>
                        {fullDetails.address.taxYearAddress.city || ''}, {fullDetails.address.taxYearAddress.state || ''} {fullDetails.address.taxYearAddress.zipCode || ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No tax year address entered.</p>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-3">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider font-heading">Contact Communication Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Email</span>
                    <span className="font-bold text-slate-900 text-xs">{fullDetails?.contact?.email || client.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Phone</span>
                    <span className="font-bold text-slate-900 text-xs">{fullDetails?.contact?.phone || client.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Alternate Email</span>
                    <span className="font-bold text-slate-900 text-xs">{fullDetails?.contact?.alternateEmail || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Alternate Phone</span>
                    <span className="font-bold text-slate-900 text-xs">{fullDetails?.contact?.alternatePhone || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IDENTITY & BANK */}
          {activeTab === 'identity_bank' && (
            <div className="space-y-6">
              {/* Identity Verification */}
              <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-3">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-2 font-heading">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Identity Verification (Driver's License / State ID)
                </h3>
                {fullDetails?.identity ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">License / ID Number</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{fullDetails.identity.licenseNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">State of Issue</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.identity.stateOfIssue || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Expiration Date</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.identity.expirationDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">License Document</span>
                      {fullDetails.identity.licenseDocument ? (
                        <a
                          href={getDownloadUrl(fullDetails.identity.licenseDocument)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-primary hover:text-brand-secondary font-bold underline text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View ID File
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No file attached</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No identity verification record submitted.</p>
                )}
              </div>

              {/* Bank Details */}
              <div className="p-5 rounded-2xl bg-bg-light border border-border-subtle space-y-3">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-2 font-heading">
                  <CreditCard className="w-4 h-4 text-brand-accent" /> Bank Direct Deposit Account (IRS Refund)
                </h3>
                {fullDetails?.bank ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Bank Name</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.bank.bankName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Type</span>
                      <span className="font-bold text-brand-secondary text-xs">{fullDetails.bank.accountType || 'Checking'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Number</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{fullDetails.bank.accountNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Routing Number (ABA)</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{fullDetails.bank.routingNumber || 'N/A'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Holder Name</span>
                      <span className="font-bold text-slate-900 text-xs">{fullDetails.bank.accountHolderName || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No bank direct deposit details recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SUBMITTED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider font-heading">Uploaded Tax Documents</h3>
                  <p className="text-xs text-slate-500">All W-2s, 1099s, and tax documents submitted for this tax year.</p>
                </div>
                <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-bg-light border border-border-subtle rounded-xl">
                  {fullDetails?.documents?.length || 0} Total Files
                </span>
              </div>

              {fullDetails?.documents && fullDetails.documents.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-border-subtle rounded-2xl overflow-hidden bg-white">
                  {fullDetails.documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{doc.fileName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            <span className="font-bold text-brand-primary">{doc.documentType}</span> &bull; {doc.person} &bull; {(doc.fileSize / 1024).toFixed(1)} KB
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status || 'Pending Review'}
                        </span>

                        {/* Quick Status Review Toggles */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={docActionLoading === doc.id}
                            onClick={() => handleDocumentStatusChange(doc.id, 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200 cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={docActionLoading === doc.id}
                            onClick={() => handleDocumentStatusChange(doc.id, 'Rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200 cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>

                        {/* Download / View Button */}
                        <a
                          href={getDownloadUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl btn-brand-primary text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-bg-light rounded-2xl border border-dashed border-border-subtle">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No documents uploaded by this user yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
