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
    <header className="h-16 bg-white border-b border-[#DCE6F2] px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-[#172B4D] tracking-tight font-heading">{title}</h1>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7FAFC] border border-[#DCE6F2] text-xs text-[#42526E]">
          <span className="w-2 h-2 rounded-full bg-[#72C900] animate-pulse" />
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
            className="p-2 rounded-xl text-[#42526E] hover:text-[#1455B8] hover:bg-[#F7FAFC] border border-[#DCE6F2] transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#1455B8]' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        {/* Notifications */}
        {/* <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-[#42526E] hover:text-[#1455B8] hover:bg-[#F7FAFC] border border-[#DCE6F2] transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1455B8] rounded-full ring-2 ring-white" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#DCE6F2] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
                <span className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">System Alerts</span>
                <span className="text-[10px] text-[#1455B8] font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="py-3 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#1455B8]/5 border border-[#1455B8]/10">
                  <div className="w-2 h-2 rounded-full bg-[#1455B8] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#172B4D]">New Consultation Scheduled</p>
                    <p className="text-[#6B778C] text-[11px]">Marcus Vance selected Tuesday, March 17 at 10:00 AM CST.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#72C900]/10 border border-[#72C900]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5CA300] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#172B4D]">New Portal User Registered</p>
                    <p className="text-[#6B778C] text-[11px]">Jonathan Miller created an account from the registration modal.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div> */}

        {/* Staff Profile Avatar & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#DCE6F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1455B8] to-[#1688E8] text-white flex items-center justify-center font-black text-xs shadow-xs">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-[#172B4D]">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#6B778C]">{user?.email || 'admin@taxfiler.com'}</p>
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
