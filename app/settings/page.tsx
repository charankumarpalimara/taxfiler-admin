'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Copy, Check, Globe, RefreshCw } from 'lucide-react';
import { ApiResponse, Submission } from '@/types';

export default function SettingsPage() {
  const [copied, setCopied] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'testing' | 'success' | 'error' | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleTestPing = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch('/api/submissions');
      const data: ApiResponse<Submission[]> = await res.json();
      if (data.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
  };

  return (
    <AdminLayout title="API Endpoints & Website Integration">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Website Integration & Webhooks</h2>
          <p className="text-xs text-slate-500">
            Use these REST API endpoints to receive inquiries from the public website or third-party webhooks.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Next.js REST API Server</h4>
              <p className="text-xs text-slate-500">CORS enabled for all origins (*)</p>
            </div>
          </div>
          <button
            onClick={handleTestPing}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin text-blue-600' : ''}`} />
            {testStatus === 'success' ? 'Connected ✓' : testStatus === 'error' ? 'Failed' : 'Test Ping'}
          </button>
        </div>

        {/* Submissions Endpoint */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">/api/submissions</span>
            </div>
            <button
              onClick={() => copyToClipboard('http://localhost:3000/api/submissions', 'sub')}
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              {copied === 'sub' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'sub' ? 'Copied' : 'Copy Endpoint'}
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Accepts JSON payload from the booking calendar or contact form and stores it in the admin dashboard.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-200 overflow-x-auto">
            <pre>{`fetch('http://localhost:3000/api/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 (512) 555-0199',
    scheduledDate: 'Friday, March 20, 2026',
    scheduledTime: '10:00 AM Central Time (CST)',
    services: ['Tax Preparation', 'Tax Planning'],
    leadSource: 'Website Direct',
    notes: 'Need LLC return filed'
  })
});`}</pre>
          </div>
        </div>

        {/* Registrations Endpoint */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">/api/registrations</span>
            </div>
            <button
              onClick={() => copyToClipboard('http://localhost:3000/api/registrations', 'reg')}
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              {copied === 'reg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'reg' ? 'Copied' : 'Copy Endpoint'}
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Accepts new portal account registrations created from the navbar popup modal.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-200 overflow-x-auto">
            <pre>{`fetch('http://localhost:3000/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+1 (512) 555-0199',
    accountType: 'Business Portal'
  })
});`}</pre>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
