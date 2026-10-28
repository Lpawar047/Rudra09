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
  colorBg = 'bg-[#FEF9C3] dark:bg-[#1F1F1F]',
  colorText = 'text-[#000000] dark:text-[#FACC15]',
  trend,
  trendUp,
}) => {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#D6D6D6] dark:border-[#1F1F1F] p-5 shadow-xs hover:shadow-md hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#D6D6D6]">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-[#666666] dark:text-[#D6D6D6] font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorBg} ${colorText} shrink-0 border border-[#EAB308]/40 dark:border-[#FACC15]/30`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] dark:border-[#1F1F1F] flex items-center text-xs">
          <span className="font-bold text-[#000000] dark:text-[#FACC15]">
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-[#666666] dark:text-[#D6D6D6] ml-1.5 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
};

