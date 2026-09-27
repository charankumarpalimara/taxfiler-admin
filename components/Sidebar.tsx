'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Calendar,
  Sliders,
  ArrowUpRight,
  ShieldCheck,
  Contact,
  LucideIcon
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Form Submissions', href: '/submissions', icon: Inbox, badge: 'Live' },
  { name: 'Portal Registrations', href: '/registrations', icon: Users },
  { name: 'Clients', href: '/clients', icon: Contact },
  { name: 'Appointment Schedule', href: '/calendar', icon: Calendar },
  // { name: 'API & Webhooks', href: '/settings', icon: Sliders },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0E3E85] text-white flex flex-col shrink-0 border-r border-[#1455B8]/40 select-none shadow-xl">
      {/* Brand Header with NexGen Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-[#1455B8]/50 bg-[#0A2E63]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white p-1.5 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.jpeg"
              alt="NexGen Accounting Group Logo"
              className="h-9 w-auto object-contain rounded-md"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block font-heading">
              NexGen
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#8AE012] block -mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#72C900]/20 text-[#8AE012] border border-[#72C900]/40">
          v2.0
        </span>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-blue-200/60">
          Management
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${isActive
                ? 'bg-gradient-to-r from-[#1455B8] to-[#1688E8] text-white shadow-lg shadow-[#1455B8]/40 border border-white/20'
                : 'text-blue-100/80 hover:bg-[#1455B8]/40 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-200/70 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#72C900] text-slate-900 font-extrabold' : 'bg-[#72C900]/20 text-[#8AE012] border border-[#72C900]/30'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-blue-200/60">
          External
        </div>

        {/* Live Website Link */}
        <a
          href="https://www.nexgenaccountinggroup.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-blue-100/80 hover:bg-[#1455B8]/40 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-4 h-4 text-blue-200/70 group-hover:text-[#8AE012]" />
            <span>View Live Website</span>
          </div>
          <span className="text-[10px] text-blue-200/50 group-hover:text-white">5173</span>
        </a>
      </div>

      {/* Footer Security Badge */}
      <div className="p-4 border-t border-[#1455B8]/40 bg-[#0A2E63]/60">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0E3E85]/80 border border-[#1455B8]/50">
          <ShieldCheck className="w-5 h-5 text-[#8AE012] shrink-0" />
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">CPA Staff Secure</p>
            <p className="text-[10px] text-blue-200/70 truncate">SSL & TLS 256-bit</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
