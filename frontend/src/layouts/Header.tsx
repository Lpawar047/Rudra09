import React from 'react';
import { Menu, ShieldCheck, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden border border-slate-200 dark:border-slate-700 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            {user?.role} PORTAL
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Theme Switcher */}
        <ThemeToggle variant="button" />

        {/* Notification Bell */}
        <button
          type="button"
          className="min-h-[40px] min-w-[40px] relative flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{user?.name}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs border border-indigo-700 shrink-0">
            {user?.name.charAt(0)}
          </div>
          <button
            onClick={logout}
            className="min-h-[40px] min-w-[40px] hidden sm:flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};


