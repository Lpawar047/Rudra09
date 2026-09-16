import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-[#000000] text-[#FFFFFF] border border-[#FACC15]">
          <span className="w-1.5 h-1.5 mr-1 rounded-full bg-[#FFD600]"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-[#FACC15] text-[#000000] border border-[#EAB308]">
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#FFF8CC] text-[#000000] border border-[#EAB308]">
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#F2F2F2] text-[#111111] border border-[#D1D1D1]">
          LOW
        </span>
      );
  }
};
