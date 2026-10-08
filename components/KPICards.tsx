'use client';

import React from 'react';
import { Inbox, Users, CalendarCheck, Clock, LucideIcon } from 'lucide-react';
import { Submission, Registration } from '@/types';

export interface KPICardsProps {
  submissions?: Submission[];
  registrations?: Registration[];
}

interface KPICardItem {
  label: string;
  value: number;
  subtext: string;
  icon: LucideIcon;
  gradient: string;
  pill: string;
  pillColor: string;
}

export default function KPICards({
  submissions = [],
  registrations = [],
}: KPICardsProps) {
  const subsList = Array.isArray(submissions) ? submissions : [];
  const regsList = Array.isArray(registrations) ? registrations : [];

  const totalSubmissions = subsList.length;
  const newSubmissions = subsList.filter(
    (s) => s.status?.toLowerCase() === 'new'
  ).length;
  const totalRegistrations = regsList.length;
  const scheduledCount = subsList.filter(
    (s) => s.scheduledDate && s.scheduledDate !== 'Not Scheduled'
  ).length;

  const cards: KPICardItem[] = [
    {
      label: "Total Form Inquiries",
      value: totalSubmissions,
      subtext: `${newSubmissions} unread / new requests`,
      icon: Inbox,
      gradient: "from-brand-primary to-brand-secondary",
      pill: "+18% this month",
      pillColor: "text-brand-primary bg-brand-primary/10 border-brand-primary/20 font-bold",
    },
    {
      label: "CPA Consultations",
      value: scheduledCount,
      subtext: "Selected appointment slots",
      icon: CalendarCheck,
      gradient: "from-brand-secondary to-brand-primary",
      pill: "Active Calendar",
      pillColor: "text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20 font-bold",
    },
    {
      label: "Portal Registrations",
      value: totalRegistrations,
      subtext: "Verified client accounts",
      icon: Users,
      gradient: "from-brand-gold-dark to-brand-gold",
      pill: "+24% new signups",
      pillColor: "text-brand-gold-dark bg-brand-gold/15 border-brand-gold/30 font-bold",
    },
    {
      label: "Action Required",
      value: newSubmissions,
      subtext: "Awaiting CPA response",
      icon: Clock,
      gradient: newSubmissions > 0 ? "from-brand-primary to-brand-gold" : "from-brand-blue-dark to-text-mid",
      pill: newSubmissions > 0 ? "High Priority" : "All Caught Up",
      pillColor:
        newSubmissions > 0
          ? "text-brand-gold-dark bg-brand-gold/15 border-brand-gold/30 font-bold"
          : "text-text-light bg-bg-light border-border-subtle",
    },
  ];

  return (
    <div className="bg-white rounded-md border border-border-subtle shadow-sm p-5 lg:p-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:gap-x-8 sm:gap-y-6 xl:gap-y-0 xl:divide-x divide-slate-100">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`flex flex-col justify-between ${
                i === 0
                  ? 'xl:pr-6'
                  : i === cards.length - 1
                  ? 'pt-5 sm:pt-0 xl:pl-6'
                  : 'pt-5 sm:pt-0 xl:px-6'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-text-light uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl lg:text-3xl font-black text-text-dark mt-1 tracking-tight font-heading">
                    {card.value}
                  </h3>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                <span className="text-text-mid font-medium truncate text-[11px]">{card.subtext}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${card.pillColor}`}>
                  {card.pill}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
