'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Submission } from '@/types';

export interface NewSubmissionModalProps {
  onClose: () => void;
  onAdd: (submission: Partial<Submission>) => Promise<void>;
}

export default function NewSubmissionModal({
  onClose,
  onAdd,
}: NewSubmissionModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    scheduledDate: '',
    scheduledTime: '10:00 AM Central Time (CST)',
    preferredLanguage: 'English',
    service: 'Tax Preparation',
    leadSource: 'Phone / Walk-In',
    notes: '',
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      alert('Please fill in client name and email');
      return;
    }

    setLoading(true);
    await onAdd({
      clientName: `${formData.firstName} ${formData.lastName}`.trim(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      scheduledDate: formData.scheduledDate || 'Not Scheduled',
      scheduledTime: formData.scheduledTime,
      preferredLanguage: formData.preferredLanguage,
      services: [formData.service],
      leadSource: formData.leadSource,
      notes: formData.notes,
      status: 'New',
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#DCE6F2] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#0E3E85] to-[#1455B8] text-white flex items-center justify-between">
          <h3 className="font-extrabold text-sm font-heading">Add New Client Inquiry / Booking</h3>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 cursor-pointer transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Marcus"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Vance"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (512) 000-0000"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Service Needed</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              >
                <option value="Tax Preparation">Tax Preparation</option>
                <option value="Bookkeeping">Bookkeeping</option>
                <option value="Payroll">Payroll</option>
                <option value="Tax Planning">Tax Planning</option>
                <option value="ERC Tax Credit Consulting">ERC Tax Credit</option>
                <option value="General Consulting">General Consulting</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Lead Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              >
                <option value="Phone / Walk-In">Phone / Walk-In</option>
                <option value="Referral">Client / CPA Referral</option>
                <option value="Website Direct">Website Direct</option>
                <option value="Google Search">Google Search</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Scheduled Date (Optional)</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Time Slot</label>
              <select
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              >
                <option value="10:00 AM Central Time (CST)">10:00 AM CST</option>
                <option value="02:00 PM Central Time (CST)">02:00 PM CST</option>
                <option value="04:30 PM Central Time (CST)">04:30 PM CST</option>
                <option value="Flexible / TBD">Flexible / TBD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#172B4D] block mb-1">Notes / Requirements</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter client background notes, entity type, filing status..."
              className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDF2F7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EDF2F7] hover:bg-[#DCE6F2] text-[#172B4D] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#1455B8] hover:bg-[#1688E8] text-white font-bold transition-all shadow-md shadow-[#1455B8]/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
