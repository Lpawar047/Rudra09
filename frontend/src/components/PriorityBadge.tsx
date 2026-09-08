import React from 'react';
import { Priority } from '../types';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-600 dark:bg-rose-600/90 text-white shadow-xs">
          <AlertCircle className="w-3 h-3 mr-1" /> CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500 dark:bg-amber-600 text-white shadow-xs">
          <AlertTriangle className="w-3 h-3 mr-1" /> HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <ArrowUp className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" /> MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <ArrowDown className="w-3 h-3 mr-1 text-slate-500 dark:text-slate-400" /> LOW
        </span>
      );
  }
};
