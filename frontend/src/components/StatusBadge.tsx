import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = (s: string) => {
    const uppercaseStatus = (s || '').toUpperCase().trim();
    switch (uppercaseStatus) {
      case 'PAID':
        return 'bg-[#DCFCE7] text-[#166534] border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'UNPAID':
        return 'bg-[#FEF3C7] text-[#92400E] border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'CLOSED':
        return 'bg-[#D1FAE5] text-[#065F46] border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'ACTIVE':
      case 'RECOVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'IN_PROGRESS':
      case 'UNDER_RECOVERY':
      case 'RECOVERY':
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800';
      case 'CONTACTED':
      case 'PROMISE_TO_PAY':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
      case 'PENDING':
      case 'OVERDUE':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      case 'REJECTED':
      case 'LEGAL_ACTION':
      case 'SOLD':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      case 'DISABLED':
      case 'UNABLE_TO_CONTACT':
      case 'INACTIVE':
      case 'ON_LEAVE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const formattedStatus = status ? status.replace(/_/g, ' ') : 'N/A';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStyle(status)} shadow-2xs select-none`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current shrink-0"></span>
      <span>{formattedStatus}</span>
    </span>
  );
};

