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
            ? 'bg-[#1F1F1F] text-[#FACC15] border-[#333333] hover:bg-[#333333]'
            : 'bg-[#F2F2F2] text-[#111111] border-[#D6D6D6] hover:bg-[#D6D6D6]'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-[#111111]" />
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
          ? 'bg-[#1F1F1F] text-[#FACC15] hover:text-[#FFD600] hover:bg-[#333333] border-[#333333] shadow-xs'
          : 'bg-[#FFFFFF] text-[#111111] hover:text-[#000000] hover:bg-[#F2F2F2] border-[#D6D6D6] shadow-2xs'
      } active:scale-95 ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FACC15] transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#111111] transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
