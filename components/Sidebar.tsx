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
  FileText,
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
  { name: 'User Documents', href: '/documents', icon: FileText, badge: 'Tax Docs' },
  { name: 'Appointment Schedule', href: '/calendar', icon: Calendar },
  // { name: 'API & Webhooks', href: '/settings', icon: Sliders },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-primary text-white flex flex-col shrink-0 border-r border-brand-secondary/60 select-none shadow-2xl">
      {/* Brand Header with NexGen Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-brand-secondary/60 bg-brand-blue-dark">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white p-1.5 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            <img
              src="/dark-logo.jpeg"
              alt="NexGen Accounting Group Logo"
              className="h-8 w-auto object-contain rounded-md"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block font-heading">
              NexGen
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-accent block -mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>
        {/* <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/20 text-brand-gold-light border border-brand-accent/40">
          v2.0
        </span> */}
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-lg shadow-brand-blue-dark/60 border border-brand-accent/30'
                : 'text-slate-300 hover:bg-brand-secondary/50 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-gold-light' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-accent text-text-dark font-extrabold' : 'bg-brand-accent/20 text-brand-gold-light border border-brand-accent/30'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          External
        </div>

        {/* Live Website Link */}
        <a
          href="https://www.nexgenaccountinggroup.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-brand-secondary/50 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-gold-light" />
            <span>View Live Website</span>
          </div>
          <span className="text-[10px] text-slate-400 group-hover:text-white">Live</span>
        </a>
      </div>

      {/* Footer Security Badge */}
      {/* <div className="p-4 border-t border-brand-secondary/60 bg-brand-blue-dark/80">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-primary border border-brand-secondary/60">
          <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0" />
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">CPA Staff Secure</p>
            <p className="text-[10px] text-slate-400 truncate">SSL & TLS 256-bit</p>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
