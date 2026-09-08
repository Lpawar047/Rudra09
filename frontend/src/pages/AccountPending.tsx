import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AccountPending: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Registration Pending Approval</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 leading-relaxed">
            Your account registration has been submitted successfully and is currently under review by the Administrator.
          </p>
        </div>

        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Next Steps:
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
            Once an Administrator reviews and approves your account, you will be able to log in with your email address and password.
          </p>
        </div>

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
