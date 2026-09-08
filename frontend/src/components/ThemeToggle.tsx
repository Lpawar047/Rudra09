import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'pill' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'button' }) => {
  const { actualTheme, toggleTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
          isDark
            ? 'bg-slate-850 text-amber-300 border-slate-700 hover:bg-slate-800'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all border ${
        isDark
          ? 'bg-slate-850 text-amber-400 hover:text-amber-300 hover:bg-slate-800 border-slate-700 shadow-xs'
          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 shadow-2xs'
      } active:scale-95 ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
