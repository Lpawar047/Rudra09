import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AccountPending: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white border border-[#D6D6D6] rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-[#FEF9C3] text-[#000000] rounded-full flex items-center justify-center mx-auto border border-[#EAB308]/40">
          <Clock className="w-8 h-8 text-[#EAB308]" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#111111] tracking-tight">Registration Pending Approval</h2>
          <p className="text-xs text-[#666666] font-medium mt-2 leading-relaxed">
            Your account registration has been submitted successfully and is currently under review by the Administrator.
          </p>
        </div>

        <div className="p-4 bg-[#FEF9C3] border border-[#EAB308]/40 rounded-xl text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#000000] font-black">
            <ShieldAlert className="w-4 h-4 text-[#EAB308]" /> Next Steps:
          </div>
          <p className="text-[#333333] text-xs font-medium leading-relaxed">
            Once an Administrator reviews and approves your account, you will be able to log in with your email address and password.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl transition-all shadow-xs border border-[#EAB308]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
