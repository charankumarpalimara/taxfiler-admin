'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PortalStatus, Registration } from '@/types';

export interface NewRegistrationModalProps {
  onClose: () => void;
  onAdd: (registration: Partial<Registration>) => Promise<void>;
}

export default function NewRegistrationModal({
  onClose,
  onAdd,
}: NewRegistrationModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountType: 'Business Portal',
    portalStatus: 'Verified' as PortalStatus,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      alert('Please fill in user name and email');
      return;
    }

    setLoading(true);
    await onAdd({
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      accountType: formData.accountType,
      portalStatus: formData.portalStatus,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#DCE6F2] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#0E3E85] to-[#1455B8] text-white flex items-center justify-between">
          <h3 className="font-extrabold text-sm font-heading">Register New Client Account</h3>
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
                placeholder="Sarah"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Jenkins"
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#172B4D] block mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@example.com"
              className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-[#172B4D] block mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (512) 000-0000"
              className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              >
                <option value="Business Portal">Business Portal</option>
                <option value="Individual Tax Client">Individual Tax Client</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#172B4D] block mb-1">Initial Status</label>
              <select
                value={formData.portalStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    portalStatus: e.target.value as PortalStatus,
                  })
                }
                className="w-full p-2.5 rounded-xl border border-[#DCE6F2] focus:outline-none focus:border-[#1455B8] text-[#172B4D] bg-[#F7FAFC] focus:bg-white"
              >
                <option value="Verified">Verified</option>
                <option value="Active">Active</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
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
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
