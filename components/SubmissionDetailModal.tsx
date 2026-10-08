'use client';

import React, { useState, useEffect } from 'react';
import { Submission, SubmissionStatus } from '@/types';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  Trash2,
  Globe,
  Tag
} from 'lucide-react';

export interface SubmissionDetailModalProps {
  submission: Submission;
  onClose: () => void;
  onUpdateStatus: (id: string, status: SubmissionStatus, staffNote?: string) => void;
  onDelete: (id: string) => void;
}

const statuses: SubmissionStatus[] = [
  'New',
  'In Progress',
  'Contacted',
  'Completed',
  'Archived',
];

const getStatusButtonClass = (st: SubmissionStatus, isActive: boolean) => {
  if (!isActive) {
    return 'bg-bg-light hover:bg-bg-subtle text-text-mid border border-border-subtle';
  }
  switch (st) {
    case 'New':
      return 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-500';
    case 'In Progress':
      return 'bg-brand-secondary text-brand-gold-light shadow-md shadow-brand-secondary/30 border border-brand-accent/40';
    case 'Contacted':
      return 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-600';
    case 'Completed':
      return 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-600';
    case 'Archived':
      return 'bg-slate-600 text-white shadow-md shadow-slate-600/25 border border-slate-600';
    default:
      return 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 border border-brand-primary';
  }
};

export default function SubmissionDetailModal({
  submission,
  onClose,
  onUpdateStatus,
  onDelete,
}: SubmissionDetailModalProps) {
  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus>(submission.status);
  const [staffNote, setStaffNote] = useState<string>(submission.staffNote || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setCurrentStatus(submission.status);
    setStaffNote(submission.staffNote || '');
  }, [submission.status, submission.staffNote]);

  const handleStatusChange = (newStatus: SubmissionStatus) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(submission.id, newStatus, staffNote);
  };

  const handleSaveNote = () => {
    onUpdateStatus(submission.id, currentStatus, staffNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-blue-dark to-brand-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStatus === 'New'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : currentStatus === 'In Progress'
                    ? 'bg-brand-secondary/40 text-brand-gold-light border border-brand-accent/40'
                    : currentStatus === 'Contacted'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40'
                }`}
            >
              {currentStatus}
            </span>
            <span className="text-xs text-slate-300 font-mono">ID: {submission.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-text-dark">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bg-subtle">
            <div>
              <h2 className="text-2xl font-black text-text-dark font-heading">{submission.clientName}</h2>
              <p className="text-xs text-text-light mt-0.5">
                Submitted {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${submission.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
              <a
                href={`tel:${submission.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold-dark text-xs font-bold border border-brand-gold/30 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>

          {/* Consultation Schedule Info */}
          <div className="bg-bg-light rounded-2xl p-4 border border-border-subtle">
            <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-3">
              Consultation Schedule & Logistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-text-dark">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span className="font-bold">Date:</span>
                <span>{submission.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-2 text-text-dark">
                <Clock className="w-4 h-4 text-brand-secondary" />
                <span className="font-bold">Time:</span>
                <span>{submission.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2 text-text-dark">
                <Globe className="w-4 h-4 text-brand-gold-dark" />
                <span className="font-bold">Language:</span>
                <span>{submission.preferredLanguage || 'English'}</span>
              </div>
              <div className="flex items-center gap-2 text-text-dark">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Source:</span>
                <span>{submission.leadSource || 'Website'}</span>
              </div>
            </div>
          </div>

          {/* Requested Services */}
          <div>
            <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">
              Requested Services
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(submission.services) && submission.services.length > 0 ? (
                submission.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold border border-brand-primary/20"
                  >
                    {srv}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-light">General Consultation</span>
              )}
            </div>
          </div>

          {/* Client Notes / Inquiries */}
          <div>
            <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">
              Client Message & Requirements
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-border-subtle text-xs text-text-dark leading-relaxed font-sans shadow-xs whitespace-pre-wrap">
              {submission.notes || 'No message provided.'}
            </div>
          </div>

          {/* Quick Status Updater */}
          <div>
            <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">
              Update Pipeline Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${getStatusButtonClass(
                    st,
                    currentStatus === st
                  )}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-text-light uppercase tracking-wider">
                CPA Staff Internal Notes
              </h4>
              {isSaved && (
                <span className="text-xs font-bold text-brand-gold-dark flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              placeholder="e.g. Spoke on phone, scheduled zoom for next Monday. Sent tax questionnaire..."
              className="w-full p-3 rounded-xl border border-border-subtle text-xs text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-bg-light focus:bg-white"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNote}
                type="button"
                className="px-4 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-bg-light border-t border-border-subtle flex items-center justify-between">
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
            className="px-5 py-2 rounded-xl bg-bg-subtle hover:bg-border-subtle text-text-dark text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
