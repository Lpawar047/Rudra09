import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AccountRejected: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white border border-[#D6D6D6] rounded-2xl p-8 text-center space-y-6 shadow-md">
        <div className="w-16 h-16 bg-[#1F1F1F] text-[#D6D6D6] rounded-full flex items-center justify-center mx-auto border border-[#333333]">
          <XCircle className="w-8 h-8 text-[#D6D6D6]" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#111111] tracking-tight">Registration Rejected</h2>
          <p className="text-xs text-[#111111] font-black mt-2">
            Your account registration was rejected by Admin.
          </p>
        </div>

        <p className="text-xs text-[#666666] font-medium leading-relaxed">
          Please contact the Rudra Services Administrator if you believe this is an error or require further assistance.
        </p>

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
