'use client';

import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, CheckCircle2, LogOut, User as UserIcon } from 'lucide-react';
import { AuthService, AdminUser } from '@/services/auth.service';

export interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  title?: string;
}

export default function Header({
  onRefresh,
  isRefreshing = false,
  title = "Dashboard Overview",
}: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setUser(AuthService.getUser());
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <header className="h-16 bg-white border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-text-dark tracking-tight font-heading">{title}</h1>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-bg-light border border-border-subtle text-xs text-text-mid">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="font-medium text-[11px]">Real-time Sync Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh data"
            disabled={isRefreshing}
            className="p-2 rounded-xl text-text-mid hover:text-brand-primary hover:bg-bg-light border border-border-subtle transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        {/* Staff Profile Avatar & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center font-black text-xs shadow-xs border border-brand-accent/30">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-text-dark">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-text-light">{user?.email || 'admin@taxfiler.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden xl:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
