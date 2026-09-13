'use client';

import React from 'react';
import UnifiedTable from './UnifiedTable';
import { Submission, SubmissionStatus } from '@/types';

export interface SubmissionsTableProps {
  submissions?: Submission[];
  onSelectSubmission: (submission: Submission) => void;
  onUpdateStatus: (id: string, status: SubmissionStatus) => Promise<void> | void;
  onDeleteSubmission: (id: string) => Promise<void> | void;
  onOpenNewModal?: () => void;
}

export default function SubmissionsTable(props: SubmissionsTableProps) {
  return <UnifiedTable type="submissions" {...props} />;
}
