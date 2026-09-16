import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  UserCheck,
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#111111] border-r border-[#1F1F1F] text-[#FFFFFF] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="h-20 px-4 flex items-center justify-between border-b border-[#1F1F1F] bg-[#000000]">
          <div className="flex items-center gap-3">
            <img
              src="/rudra-logo.jpg"
              alt="Rudra Services"
              className="h-11 w-auto rounded-lg object-contain bg-white p-1 border border-[#333333] shadow-xs"
            />
            <div>
              <h1 className="font-heading font-bold text-[#FFFFFF] tracking-tight text-base leading-tight">
                RUDRA SERVICES
              </h1>
              <p className="text-[11px] text-[#FACC15] font-medium tracking-wide">
                Recovery & Repo Platform
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-[#1F1F1F] border border-[#333333] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FACC15] text-[#000000] font-bold flex items-center justify-center text-sm shadow-xs border border-[#EAB308] shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-[#FFFFFF] truncate">{user.name}</p>
            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider bg-[#000000] text-[#FACC15] uppercase border border-[#FACC15]/40">
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
                  `flex items-center gap-3 px-3.5 min-h-[42px] rounded-xl text-[14px] transition-all font-sans ${
                    isActive
                      ? 'bg-[#FACC15] text-[#000000] font-semibold shadow-xs'
                      : 'text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#1F1F1F] font-medium'
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
        <div className="p-3 border-t border-[#1F1F1F] bg-[#000000]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 min-h-[42px] rounded-xl text-[14px] font-medium text-[#CCCCCC] hover:bg-[#1F1F1F] hover:text-[#FFFFFF] transition-colors border border-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-[#CCCCCC]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
