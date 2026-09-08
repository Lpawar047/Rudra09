import React from 'react';
import { Link } from 'react-router-dom';
import { Ban, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AccountDisabled: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
          <Ban className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Disabled</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-2">
            Your account has been disabled. Please contact Admin.
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Access privileges for your account have been temporarily suspended. Please reach out to your administrator to request reactivation.
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
