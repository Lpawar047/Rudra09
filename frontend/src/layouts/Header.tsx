import React from 'react';
import { Menu, ShieldCheck, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E8E8E8] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#111111] hover:bg-[#F2F2F2] lg:hidden border border-[#E8E8E8] transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#FACC15] text-[#000000] border border-[#EAB308] shadow-xs font-heading">
            <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" />
            {user?.role} PORTAL
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          className="min-h-[40px] min-w-[40px] relative flex items-center justify-center rounded-xl text-[#333333] hover:text-[#000000] hover:bg-[#F2F2F2] border border-[#D6D6D6] transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFD600] ring-2 ring-white"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#D6D6D6]">
          <div className="text-right hidden sm:block">
            <p className="text-[14px] font-semibold text-[#111111] leading-snug">{user?.name}</p>
            <p className="text-[12px] font-normal text-[#666666]">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#111111] text-[#FACC15] font-bold flex items-center justify-center text-sm shadow-xs border border-[#333333] shrink-0 font-heading">
            {user?.name.charAt(0)}
          </div>
          <button
            onClick={logout}
            className="min-h-[40px] min-w-[40px] hidden sm:flex items-center justify-center text-[#666666] hover:text-[#000000] hover:bg-[#F2F2F2] rounded-xl transition-colors border border-transparent hover:border-[#D6D6D6] ml-1 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
