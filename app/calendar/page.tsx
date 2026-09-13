'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SubmissionDetailModal from '@/components/SubmissionDetailModal';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Submission, SubmissionStatus, ApiResponse } from '@/types';

export default function CalendarPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/submissions');
      const data: ApiResponse<Submission[]> = await res.json();
      if (data.success && data.data) {
        setSubmissions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scheduledList = (Array.isArray(submissions) ? submissions : []).filter(
    (s) => s.scheduledDate && s.scheduledDate !== 'Not Scheduled'
  );

  return (
    <AdminLayout title="Consultation Schedule & Calendar" onRefresh={fetchData} isRefreshing={isRefreshing}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Upcoming CPA Consultations</h2>
            <p className="text-xs text-slate-500">
              Chronological schedule of client consultations booked via the online calendar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              {scheduledList.length} Scheduled Appointments
            </span>
          </div>
        </div>

        {scheduledList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-sm text-slate-700">No scheduled consultations yet</p>
            <p className="text-xs mt-1">When clients book a time slot on the website, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSubmission(item)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.status === 'New' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.clientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.email} • {item.phone}
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <span>{item.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>{item.scheduledTime}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(item.services || []).map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Click to view details</span>
                  <span className="text-blue-600 font-bold group-hover:underline">Open card →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdateStatus={async (id: string, status: SubmissionStatus, staffNote?: string) => {
            await fetch('/api/submissions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, status, staffNote }),
            });
            fetchData();
          }}
          onDelete={async (id: string) => {
            await fetch(`/api/submissions?id=${id}`, { method: 'DELETE' });
            fetchData();
          }}
        />
      )}
    </AdminLayout>
  );
}
