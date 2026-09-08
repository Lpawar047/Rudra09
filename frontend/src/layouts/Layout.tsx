import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 transition-colors duration-200 flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 overflow-x-hidden">
        <Header setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
