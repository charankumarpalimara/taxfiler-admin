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
  Calendar
} from 'lucide-react';
import { Submission, Registration, SubmissionStatus, ApiResponse } from '@/types';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [subRes, regRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/registrations'),
      ]);

      const subData: ApiResponse<Submission[]> = await subRes.json();
      const regData: ApiResponse<Registration[]> = await regRes.json();

      if (subData.success && subData.data) setSubmissions(subData.data);
      if (regData.success && regData.data) setRegistrations(regData.data);
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
      <div className="rounded-3xl bg-gradient-to-r from-[#0E3E85] via-[#1455B8] to-[#172B4D] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-[#1688E8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#72C900]/20 text-[#8AE012] text-xs font-bold mb-3 border border-[#72C900]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8AE012]" />
              <span>NexGen Accounting Group • Austin & Houston, Texas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
              Client Activity & Consultation Hub
            </h2>
            <p className="text-blue-100/90 text-xs sm:text-sm mt-2 leading-relaxed">
              Monitoring client form submissions, scheduled CPA appointments, and portal registrations in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              type="button"
              className="px-4.5 py-2.5 rounded-xl bg-[#72C900] hover:bg-[#8AE012] text-slate-900 font-extrabold text-xs shadow-lg shadow-[#72C900]/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-slate-900" /> Log Client Inquiry
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
            <h3 className="text-base font-bold text-[#172B4D] font-heading">Recent Form Submissions & Bookings</h3>
            <p className="text-xs text-[#6B778C]">Live feed of incoming consultations from the website</p>
          </div>
          <Link
            href="/submissions"
            className="text-xs font-bold text-[#1455B8] hover:text-[#1688E8] flex items-center gap-1"
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
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] font-heading">Recent Portal Signups</h3>
              <p className="text-xs text-[#6B778C]">Registered through the client portal modal</p>
            </div>
            <Link
              href="/registrations"
              className="text-xs font-bold text-[#1455B8] hover:text-[#1688E8] flex items-center gap-1"
            >
              Manage ({(Array.isArray(registrations) ? registrations : []).length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(Array.isArray(registrations) ? registrations : []).slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DCE6F2] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1455B8]/10 text-[#1455B8] flex items-center justify-center font-bold text-xs">
                    {reg.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-[#172B4D]">{reg.fullName}</p>
                    <p className="text-[11px] text-[#6B778C]">{reg.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    reg.portalStatus === 'Verified' ? 'bg-[#72C900]/15 text-[#5CA300] border-[#72C900]/30' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {reg.portalStatus}
                  </span>
                  <p className="text-[10px] text-[#6B778C] mt-0.5">{reg.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming CPA Consultations Snapshot */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] font-heading">Upcoming CPA Consultations</h3>
              <p className="text-xs text-[#6B778C]">Booked client consultation appointments</p>
            </div>
            <Link
              href="/calendar"
              className="text-xs font-bold text-[#1455B8] hover:text-[#1688E8] flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-[#F7FAFC] hover:bg-[#1455B8]/5 border border-[#DCE6F2] cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#1455B8]/10 text-[#1455B8] shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#172B4D]">{item.clientName}</p>
                      <p className="text-[11px] text-[#6B778C]">
                        {item.scheduledDate} • {item.scheduledTime}
                      </p>
                      <p className="text-[10px] text-[#1455B8] font-bold mt-0.5">
                        {(item.services || []).join(', ')}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    item.status === 'New' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-[#1455B8]/10 text-[#1455B8] border-[#1455B8]/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
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
