'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminLayout({
  children,
  title,
  onRefresh,
  isRefreshing,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} onRefresh={onRefresh} isRefreshing={isRefreshing} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
