'use client';

import React, { useState } from 'react';
import { X, UserPlus, Building, Mail, Phone, Calendar, UserCheck, FileText } from 'lucide-react';
import { Client, ClientStatus, ClientType } from '@/types';

export interface NewClientModalProps {
  onClose: () => void;
  onAdd: (client: Partial<Client>) => Promise<void>;
}

export default function NewClientModal({ onClose, onAdd }: NewClientModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    clientType: 'Corporate' as ClientType,
    assignedCPA: 'David Miller, CPA',
    taxYear: '2025',
    status: 'Active' as ClientStatus,
    notes: '',
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.clientName || !formData.email) {
      alert('Please enter client name and email address.');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        clientName: formData.clientName,
        companyName: formData.companyName || 'Individual',
        email: formData.email,
        phone: formData.phone,
        clientType: formData.clientType,
        assignedCPA: formData.assignedCPA,
        taxYear: formData.taxYear,
        status: formData.status,
        notes: formData.notes,
      });
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#0E3E85] via-[#1455B8] to-[#1688E8] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <UserPlus className="w-5 h-5 text-[#8AE012]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-heading tracking-wide">Add New Tax Client</h3>
              <p className="text-[11px] text-blue-100/80">Register a new client record in NexGen CPA system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Robert Sterling"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Business / Entity Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Sterling Holdings LLC or Individual"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@domain.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Client Type</label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="Corporate">Corporate</option>
                <option value="Individual">Individual</option>
                <option value="Partnership">Partnership</option>
                <option value="Small Business">Small Business</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Tax Year</label>
              <select
                value={formData.taxYear}
                onChange={(e) => setFormData({ ...formData, taxYear: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Filing Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Filing Pending">Filing Pending</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Assigned CPA / Manager
            </label>
            <select
              value={formData.assignedCPA}
              onChange={(e) => setFormData({ ...formData, assignedCPA: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all"
            >
              <option value="David Miller, CPA">David Miller, CPA (Senior Tax Partner)</option>
              <option value="Sarah Jenkins, CPA">Sarah Jenkins, CPA (Corporate Specialist)</option>
              <option value="Michael Chang, CPA">Michael Chang, CPA (Partnership & Estate)</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Client Tax & Service Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add tax preparation notes, required forms (1040, 1120S, K-1), special deductions..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1455B8] to-[#1688E8] hover:opacity-90 text-white font-bold transition-all shadow-md shadow-[#1455B8]/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Adding Client...' : 'Save Client Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
