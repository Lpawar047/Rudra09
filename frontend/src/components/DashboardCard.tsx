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
  colorBg = 'bg-[#FEF9C3]',
  colorText = 'text-[#000000]',
  trend,
  trendUp,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D1] border-l-4 border-l-[#FACC15] p-5 shadow-xs hover:shadow-md hover:border-[#EAB308] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#666666]">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight font-heading tabular-nums">{value}</h3>
          {subtext && <p className="text-[12px] text-[#666666] font-normal">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorBg} ${colorText} shrink-0 border border-[#EAB308]/40 shadow-2xs`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-[#E8E8E8] flex items-center text-[12px]">
          <span className="font-semibold text-[#000000] tabular-nums">
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-[#666666] ml-1.5 font-normal">vs last month</span>
        </div>
      )}
    </div>
  );
};

