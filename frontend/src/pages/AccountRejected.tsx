import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AccountRejected: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <XCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Registration Rejected</h2>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-2">
            Your account registration was rejected by Admin.
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Please contact the Rudra Services Administrator if you believe this is an error or require further assistance.
        </p>

        <div className="pt-2">
          <Link
            to="/login"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
