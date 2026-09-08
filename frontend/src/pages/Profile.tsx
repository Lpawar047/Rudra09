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
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Account Profile</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">User identity parameters, access role, and credentials management.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-xs shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded font-extrabold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {user.role} ACCESS LEVEL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Department</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{user.department || 'Executive Operations'}</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Account Status</p>
            <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{user.status}</p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">Change Security Password</h3>

          {successMsg && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">{successMsg}</div>}
          {errorMsg && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800">{errorMsg}</div>}

          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
