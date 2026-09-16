import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Phone, Building } from 'lucide-react';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/users/${user.id}`, { password });
      setSuccessMsg('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">My Account Profile</h1>
        <p className="text-xs text-[#666666] font-medium mt-1">User identity parameters, access role, and credentials management.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#D6D6D6]">
          <div className="w-16 h-16 rounded-full bg-[#111111] text-[#FACC15] font-black flex items-center justify-center text-2xl shadow-xs shrink-0 border border-[#333333]">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-black text-[#111111]">{user.name}</h2>
            <p className="text-xs text-[#666666]">{user.email}</p>
            <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded font-black bg-[#FEF9C3] text-[#000000] border border-[#EAB308]/40">
              {user.role} ACCESS LEVEL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6]">
            <p className="text-[#666666] font-black uppercase text-[10px]">Department</p>
            <p className="font-black text-[#111111] mt-0.5">{user.department || 'Executive Operations'}</p>
          </div>
          <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6]">
            <p className="text-[#666666] font-black uppercase text-[10px]">Account Status</p>
            <p className="font-black text-[#000000] mt-0.5">{user.status}</p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="pt-4 border-t border-[#D6D6D6]">
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4">Change Security Password</h3>

          {successMsg && <div className="mb-4 p-3 bg-[#FEF9C3] text-[#000000] text-xs font-black rounded-xl border border-[#EAB308]">{successMsg}</div>}
          {errorMsg && <div className="mb-4 p-3 bg-[#1F1F1F] text-[#FFFFFF] text-xs font-black rounded-xl border border-[#333333]">{errorMsg}</div>}

          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-colors border border-[#EAB308]"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
