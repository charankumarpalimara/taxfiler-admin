'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Clock, Globe, Tag, Check, Trash2 } from 'lucide-react';
import { Submission, SubmissionStatus } from '@/types';

export interface SubmissionDetailModalProps {
  submission: Submission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: SubmissionStatus, staffNote?: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const statuses: SubmissionStatus[] = ['New', 'In Progress', 'Contacted', 'Completed', 'Archived'];

export default function SubmissionDetailModal({
  submission,
  onClose,
  onUpdateStatus,
  onDelete,
}: SubmissionDetailModalProps) {
  if (!submission) return null;

  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus>(submission.status || 'New');
  const [staffNote, setStaffNote] = useState<string>(submission.staffNote || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    setCurrentStatus(newStatus);
    await onUpdateStatus(submission.id, newStatus, staffNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveNote = async () => {
    await onUpdateStatus(submission.id, currentStatus, staffNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#DCE6F2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0E3E85] to-[#1455B8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentStatus === 'New'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : currentStatus === 'In Progress'
                  ? 'bg-[#1688E8]/20 text-[#1688E8] border border-[#1688E8]/40'
                  : currentStatus === 'Contacted'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-[#72C900]/20 text-[#8AE012] border border-[#72C900]/40'
              }`}
            >
              {currentStatus}
            </span>
            <span className="text-xs text-blue-200/80 font-mono">ID: {submission.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#172B4D]">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
            <div>
              <h2 className="text-2xl font-black text-[#172B4D] font-heading">{submission.clientName}</h2>
              <p className="text-xs text-[#6B778C] mt-0.5">
                Submitted {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${submission.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1455B8]/10 hover:bg-[#1455B8]/20 text-[#1455B8] text-xs font-bold border border-[#1455B8]/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
              <a
                href={`tel:${submission.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#72C900]/15 hover:bg-[#72C900]/25 text-[#5CA300] text-xs font-bold border border-[#72C900]/30 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>

          {/* Consultation Schedule Info */}
          <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#DCE6F2]">
            <h4 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider mb-3">
              Consultation Schedule & Logistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#172B4D]">
                <Calendar className="w-4 h-4 text-[#1455B8]" />
                <span className="font-bold">Date:</span>
                <span>{submission.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-2 text-[#172B4D]">
                <Clock className="w-4 h-4 text-[#1688E8]" />
                <span className="font-bold">Time:</span>
                <span>{submission.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2 text-[#172B4D]">
                <Globe className="w-4 h-4 text-[#5CA300]" />
                <span className="font-bold">Language:</span>
                <span>{submission.preferredLanguage || 'English'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#172B4D]">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Source:</span>
                <span>{submission.leadSource || 'Website'}</span>
              </div>
            </div>
          </div>

          {/* Requested Services */}
          <div>
            <h4 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider mb-2">
              Requested Services
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(submission.services) && submission.services.length > 0 ? (
                submission.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-[#1455B8]/10 text-[#1455B8] text-xs font-bold border border-[#1455B8]/20"
                  >
                    {srv}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#6B778C]">General Consultation</span>
              )}
            </div>
          </div>

          {/* Client Notes / Inquiries */}
          <div>
            <h4 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider mb-2">
              Client Message & Requirements
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-[#DCE6F2] text-xs text-[#172B4D] leading-relaxed font-sans shadow-xs whitespace-pre-wrap">
              {submission.notes || 'No message provided.'}
            </div>
          </div>

          {/* Quick Status Updater */}
          <div>
            <h4 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider mb-2">
              Update Pipeline Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentStatus === st
                      ? 'bg-[#1455B8] text-white shadow-md shadow-[#1455B8]/20'
                      : 'bg-[#F7FAFC] hover:bg-[#EDF2F7] text-[#42526E] border border-[#DCE6F2]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">
                CPA Staff Internal Notes
              </h4>
              {isSaved && (
                <span className="text-xs font-bold text-[#5CA300] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              placeholder="e.g. Spoke on phone, scheduled zoom for next Monday. Sent tax questionnaire..."
              className="w-full p-3 rounded-xl border border-[#DCE6F2] text-xs text-[#172B4D] placeholder:text-[#6B778C] focus:outline-none focus:ring-2 focus:ring-[#1455B8]/20 focus:border-[#1455B8] bg-[#F7FAFC] focus:bg-white"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNote}
                type="button"
                className="px-4 py-1.5 rounded-xl bg-[#0E3E85] hover:bg-[#1455B8] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F7FAFC] border-t border-[#DCE6F2] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this submission?')) {
                onDelete(submission.id);
                onClose();
              }
            }}
            type="button"
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Submission
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-[#EDF2F7] hover:bg-[#DCE6F2] text-[#172B4D] text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
