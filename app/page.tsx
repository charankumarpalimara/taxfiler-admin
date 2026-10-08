'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import KPICards from '@/components/KPICards';
import UnifiedTable from '@/components/UnifiedTable';
import SubmissionDetailModal from '@/components/SubmissionDetailModal';
import NewSubmissionModal from '@/components/NewSubmissionModal';
import Link from 'next/link';
import {
  Inbox,
  ArrowRight,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';
import { Submission, Registration, UserDocument, SubmissionStatus, ApiResponse } from '@/types';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [subRes, regRes, docRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/registrations'),
        fetch('/api/documents'),
      ]);

      const subData: ApiResponse<Submission[]> = await subRes.json();
      const regData: ApiResponse<Registration[]> = await regRes.json();
      const docData: ApiResponse<UserDocument[]> = await docRes.json();

      if (subData.success && subData.data) setSubmissions(subData.data);
      if (regData.success && regData.data) setRegistrations(regData.data);
      if (docData.success && docData.data) setDocuments(docData.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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
      const res = await fetch(`/api/submissions?id=${id}`, {
        method: 'DELETE',
      });
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

  return (
    <AdminLayout
      title="Executive Overview"
      onRefresh={fetchData}
      isRefreshing={isRefreshing}
    >
      {/* Welcome Banner with NexGen Brand Colors */}
      <div className="rounded-md bg-gradient-to-r from-brand-blue-dark via-brand-primary to-brand-secondary p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-brand-accent/20">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-accent/20 text-brand-gold-light text-xs font-bold mb-3 border border-brand-accent/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-light" />
              <span>NexGen Accounting Group • Austin & Houston, Texas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
              Client Activity & Consultation Hub
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Monitoring client form submissions, scheduled CPA appointments, and portal registrations in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              type="button"
              className="px-4.5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-gold-light text-text-dark font-extrabold text-xs shadow-lg shadow-brand-accent/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-text-dark" /> Log Client Inquiry
            </button>
            <Link
              href="/submissions"
              className="px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              View All Inquiries <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <KPICards submissions={submissions} registrations={registrations} />

      {/* Recent Submissions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-dark font-heading">Recent Form Submissions & Bookings</h3>
            <p className="text-xs text-text-light">Live feed of incoming consultations from the website</p>
          </div>
          <Link
            href="/submissions"
            className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
          >
            View all ({Array.isArray(submissions) ? submissions.length : 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <UnifiedTable
          type="submissions"
          data={submissions}
          onSelectSubmission={setSelectedSubmission}
          onUpdateStatus={handleUpdateStatus}
          onDeleteSubmission={handleDeleteSubmission}
          onOpenNewModal={() => setShowNewModal(true)}
        />
      </div>

      {/* Split Section: Recent Portal Registrations & Quick Calendar Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portal Registrations Preview */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-bg-subtle">
            <div>
              <h3 className="font-bold text-sm text-text-dark font-heading">Recent Portal Signups</h3>
              <p className="text-xs text-text-light">Registered through the client portal modal</p>
            </div>
            <Link
              href="/registrations"
              className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
            >
              Manage ({(Array.isArray(registrations) ? registrations : []).length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(Array.isArray(registrations) ? registrations : []).slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                    {reg.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">{reg.fullName}</p>
                    <p className="text-[11px] text-text-light">{reg.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${reg.portalStatus === 'Verified' ? 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/30' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {reg.portalStatus}
                  </span>
                  <p className="text-[10px] text-text-light mt-0.5">{reg.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming CPA Consultations Snapshot */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-bg-subtle">
            <div>
              <h3 className="font-bold text-sm text-text-dark font-heading">Upcoming CPA Consultations</h3>
              <p className="text-xs text-text-light">Booked client consultation appointments</p>
            </div>
            <Link
              href="/calendar"
              className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(Array.isArray(submissions) ? submissions : [])
              .filter((s) => s.scheduledDate && s.scheduledDate !== 'Not Scheduled')
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSubmission(item)}
                  className="p-3 rounded-xl bg-bg-light hover:bg-brand-primary/5 border border-border-subtle cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-text-dark">{item.clientName}</p>
                      <p className="text-[11px] text-text-light">
                        {item.scheduledDate} • {item.scheduledTime}
                      </p>
                      <p className="text-[10px] text-brand-primary font-bold mt-0.5">
                        {(item.services || []).join(', ')}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${item.status === 'New' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                    }`}>
                    {item.status}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Tax Document Submissions */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-bg-subtle">
            <div>
              <h3 className="font-bold text-sm text-text-dark font-heading flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" />
                Recent User Tax Document Submissions
              </h3>
              <p className="text-xs text-text-light">W-2s, 1099s, and identification files uploaded by portal clients</p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
            >
              All Documents ({(Array.isArray(documents) ? documents : []).length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {(Array.isArray(documents) ? documents : []).slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-bg-light border border-border-subtle flex flex-col justify-between gap-2 text-xs hover:border-brand-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded text-[10px] truncate max-w-[140px]">
                      {doc.documentType}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.status === 'Approved' ? 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/30' :
                        doc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {doc.status || 'Pending'}
                    </span>
                  </div>
                  <p className="font-bold text-text-dark truncate" title={doc.fileName}>{doc.fileName}</p>
                  <p className="text-[11px] text-text-light truncate">{doc.user?.fullName || 'Portal User'}</p>
                </div>
                <div className="pt-2 border-t border-bg-subtle flex items-center justify-between text-[10px] text-text-light">
                  <span>{doc.person}</span>
                  <Link href="/documents" className="font-bold text-brand-primary hover:underline">
                    Review &rarr;
                  </Link>
                </div>
              </div>
            ))}
            {(Array.isArray(documents) ? documents : []).length === 0 && (
              <div className="col-span-full py-6 text-center text-slate-400 text-xs italic">
                No tax documents uploaded by clients yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
