import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Field Recovery');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        department,
      });
      navigate('/account-pending');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top bar theme switcher & login link */}
      <div className="absolute top-5 right-5 sm:right-8 flex items-center gap-3 z-20">
        <Link
          to="/login"
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to Login
        </Link>
        <ThemeToggle variant="button" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-block">
            <img src="/rudra-logo.jpg" alt="Rudra Services" className="h-14 w-auto object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">RUDRA SERVICES</h2>
        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
          Field Officer Registration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-md rounded-2xl sm:px-10">
          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-3 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="e.g. Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="officer@rudraservices.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="min-h-[44px] w-full px-3 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Field Recovery">Field Recovery</option>
                  <option value="Vehicle Repo">Vehicle Repo</option>
                  <option value="Legal & Notice">Legal & Notice</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium">
              ℹ️ Your registration will be created with status <strong className="font-bold text-amber-950 dark:text-amber-200">PENDING</strong> and requires Admin approval before you can access the system.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-800 pt-4 text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">Already registered? </span>
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
