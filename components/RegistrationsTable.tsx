'use client';

import React from 'react';
import UnifiedTable from './UnifiedTable';
import { Registration, PortalStatus } from '@/types';

export interface RegistrationsTableProps {
  registrations?: Registration[];
  onUpdateStatus: (id: string, status: PortalStatus) => Promise<void> | void;
  onDeleteRegistration: (id: string) => Promise<void> | void;
  onOpenNewModal?: () => void;
}

export default function RegistrationsTable(props: RegistrationsTableProps) {
  return <UnifiedTable type="registrations" {...props} />;
}
