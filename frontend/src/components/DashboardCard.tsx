import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  colorBg?: string;
  colorText?: string;
  trend?: string;
  trendUp?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorBg = 'bg-indigo-50 dark:bg-indigo-950/60',
  colorText = 'text-indigo-600 dark:text-indigo-400',
  trend,
  trendUp,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorBg} ${colorText} shrink-0 border border-slate-100 dark:border-slate-800`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
          <span className={`font-bold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-500 dark:text-slate-400 ml-1.5 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
};

