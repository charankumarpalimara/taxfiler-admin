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
      gradient: "from-[#1455B8] to-[#1688E8]",
      pill: "+18% this month",
      pillColor: "text-[#1455B8] bg-[#1455B8]/10 border-[#1455B8]/20",
    },
    {
      label: "CPA Consultations",
      value: scheduledCount,
      subtext: "Selected appointment slots",
      icon: CalendarCheck,
      gradient: "from-[#0E3E85] to-[#1455B8]",
      pill: "Active Calendar",
      pillColor: "text-[#0E3E85] bg-[#0E3E85]/10 border-[#0E3E85]/20",
    },
    {
      label: "Portal Registrations",
      value: totalRegistrations,
      subtext: "Verified client accounts",
      icon: Users,
      gradient: "from-[#5CA300] to-[#72C900]",
      pill: "+24% new signups",
      pillColor: "text-[#5CA300] bg-[#72C900]/15 border-[#72C900]/30 font-bold",
    },
    {
      label: "Action Required",
      value: newSubmissions,
      subtext: "Awaiting CPA response",
      icon: Clock,
      gradient: newSubmissions > 0 ? "from-[#1455B8] to-[#72C900]" : "from-[#172B4D] to-[#42526E]",
      pill: newSubmissions > 0 ? "High Priority" : "All Caught Up",
      pillColor:
        newSubmissions > 0
          ? "text-[#5CA300] bg-[#72C900]/15 border-[#72C900]/30 font-bold"
          : "text-[#6B778C] bg-[#F7FAFC] border-[#DCE6F2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-black text-[#172B4D] mt-2 tracking-tight font-heading">{card.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EDF2F7] flex items-center justify-between text-xs">
              <span className="text-[#42526E] font-medium truncate">{card.subtext}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${card.pillColor}`}>
                {card.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
