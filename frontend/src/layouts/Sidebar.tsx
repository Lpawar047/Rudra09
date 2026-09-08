import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  UserCheck,
  ShieldCheck,
  Truck,
  Building2,
  PhoneCall,
  CreditCard,
  BarChart3,
  User,
  Settings,
  LogOut,
  FolderOpen,
  UserCheck2,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Recovery Cases', path: '/admin/cases', icon: FolderOpen },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Managers', path: '/admin/managers', icon: UserCheck },
    { label: 'Assignments', path: '/admin/assignments', icon: UserCheck2 },
    { label: 'Customers', path: '/admin/customers', icon: Building2 },
    { label: 'Vehicles', path: '/admin/vehicles', icon: Truck },
    { label: 'Excel Import', path: '/admin/excel-upload', icon: FileSpreadsheet },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const managerLinks = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Recovery Cases', path: '/manager/cases', icon: FolderOpen },
    { label: 'Assignments', path: '/manager/assignments', icon: UserCheck2 },
    { label: 'Employees', path: '/manager/employees', icon: Users },
    { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { label: 'Profile', path: '/manager/profile', icon: User },
    { label: 'Settings', path: '/manager/settings', icon: Settings },
  ];

  const employeeLinks = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Cases', path: '/employee/cases', icon: FolderOpen },
    { label: 'Follow-ups', path: '/employee/followups', icon: PhoneCall },
    { label: 'Collections', path: '/employee/payments', icon: CreditCard },
    { label: 'My Performance', path: '/employee/performance', icon: BarChart3 },
    { label: 'Profile', path: '/employee/profile', icon: User },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'MANAGER' ? managerLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <img src="/rudra-logo.jpg" alt="Rudra Services" className="h-11 w-auto rounded-xl object-contain bg-white p-1 border border-slate-700 shadow-md" />
            <div>
              <h1 className="font-black text-white tracking-tight text-base leading-tight">RUDRA SERVICES</h1>
              <p className="text-[11px] text-indigo-400 font-bold tracking-tight">Recovery & Repo Platform</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md border border-indigo-500 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-wider bg-indigo-950 text-indigo-300 uppercase border border-indigo-800">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 min-h-[42px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 min-h-[42px] rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-800/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


