'use client';

import React, { useState } from 'react';
import { X, Building, Mail, Phone, Calendar, UserCheck, FileText, CheckCircle2, Tag } from 'lucide-react';
import { Client, ClientStatus, ClientType } from '@/types';

export interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Client>) => Promise<void>;
}

export default function ClientDetailsModal({ client, onClose, onUpdate }: ClientDetailsModalProps) {
  const [formData, setFormData] = useState({
    clientName: client.clientName,
    companyName: client.companyName || '',
    email: client.email,
    phone: client.phone,
    clientType: client.clientType,
    assignedCPA: client.assignedCPA,
    taxYear: client.taxYear,
    status: client.status,
    notes: client.notes || '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0E3E85] via-[#1455B8] to-[#1688E8] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#8AE012] font-black text-sm border border-white/20">
              {client.clientName?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base font-heading tracking-wide text-white">{client.clientName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30">
                  {client.id}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                {client.companyName || 'Individual Tax Account'} &bull; {client.clientType}
              </p>
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">Client record updated successfully!</span>
            </div>
          )}

          {/* Quick Info Header Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered On</span>
              <span className="font-semibold text-slate-900 text-xs">
                {new Date(client.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Filings</span>
              <span className="font-bold text-slate-900 text-xs">{client.totalFilings} Returns</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Last Filing</span>
              <span className="font-semibold text-slate-900 text-xs">{client.lastFilingDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Tax Year</span>
              <span className="font-bold text-[#1455B8] text-xs">{client.taxYear}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Full Client Name</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Company / Business Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Client Entity Type</label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              >
                <option value="Corporate">Corporate</option>
                <option value="Individual">Individual</option>
                <option value="Partnership">Partnership</option>
                <option value="Small Business">Small Business</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Tax Filing Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white font-bold"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Filing Pending">Filing Pending</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 mb-1 block">Tax Filing Year</label>
              <select
                value={formData.taxYear}
                onChange={(e) => setFormData({ ...formData, taxYear: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Assigned Lead CPA
            </label>
            <select
              value={formData.assignedCPA}
              onChange={(e) => setFormData({ ...formData, assignedCPA: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white"
            >
              <option value="David Miller, CPA">David Miller, CPA (Senior Tax Partner)</option>
              <option value="Sarah Jenkins, CPA">Sarah Jenkins, CPA (Corporate Specialist)</option>
              <option value="Michael Chang, CPA">Michael Chang, CPA (Partnership & Estate)</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Internal Staff Notes & Tax Records
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal CPA notes, pending documents (W2, 1099, 1120S schedules), tax filing reminders..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1455B8]/30 focus:border-[#1455B8] text-slate-900 bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1455B8] to-[#1688E8] hover:opacity-90 text-white font-bold transition-all shadow-md shadow-[#1455B8]/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
