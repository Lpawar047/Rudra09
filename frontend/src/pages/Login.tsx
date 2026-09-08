import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top bar theme switcher & home link */}
      <div className="absolute top-5 right-5 sm:right-8 flex items-center gap-3 z-20">
        <a
          href="/"
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to Home
        </a>
        <ThemeToggle variant="button" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-block">
            <img src="/rudra-logo.jpg" alt="Rudra Services Logo" className="w-44 h-auto object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">RUDRA SERVICES</h2>
        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
          Vehicle Recovery & Operational Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-md rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Email / Username
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="name@rudraservices.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[44px] block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="min-h-[44px] min-w-[44px] absolute inset-y-0 right-0 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-700 dark:text-slate-300 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                />
                <span className="ml-2 font-semibold">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Sign In Helpers */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center mb-4">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">New Field Recovery Officer? </span>
              <a href="/register" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Register Account Here
              </a>
            </div>
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@rudraservices.com', 'admin123')}
                className="min-h-[40px] py-2 px-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('manager@rudraservices.com', 'manager123')}
                className="min-h-[40px] py-2 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('employee@rudraservices.com', 'employee123')}
                className="min-h-[40px] py-2 px-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Password Instructions"
      >
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/70 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-xs font-medium">
            <p className="font-bold mb-1 text-indigo-950 dark:text-indigo-200">Administrative Access Security</p>
            For security compliance, password resets must be issued by a Rudra Services System Administrator.
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-400">Please contact your System Admin or IT Manager with your employee ID to reset credentials.</p>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowForgotModal(false)}
              className="min-h-[40px] px-5 py-2.5 bg-slate-900 dark:bg-slate-750 text-white rounded-xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
