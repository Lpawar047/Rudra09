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
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top bar theme switcher & home link */}
      <div className="absolute top-5 right-5 sm:right-8 flex items-center gap-3 z-20">
        <a
          href="/"
          className="text-xs font-bold text-[#666666] hover:text-[#000000] transition-colors"
        >
          ← Back to Home
        </a>
        <ThemeToggle variant="button" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs border border-[#D6D6D6] inline-block">
            <img src="/rudra-logo.jpg" alt="Rudra Services Logo" className="w-44 h-auto object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] tracking-tight">RUDRA SERVICES</h2>
        <p className="mt-1 text-[12px] text-[#EAB308] font-bold uppercase tracking-wider">
          Vehicle Recovery & Operational Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#D6D6D6] py-8 px-6 shadow-md rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FEF9C3] border border-[#EAB308] text-[#000000] text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Dual Options: Sign In & Register Always Visible */}
          <div className="flex rounded-xl bg-[#F2F2F2] p-1 mb-6 border border-[#D6D6D6]">
            <button
              type="button"
              className="flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg bg-white text-[#111111] shadow-xs border border-[#D6D6D6]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg text-[#666666] hover:text-[#000000] hover:bg-white/60 transition-all cursor-pointer"
            >
              Register New Account
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-2">
                Email / Username
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] block w-full pl-10 pr-3 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] placeholder:text-[#666666] text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all"
                  placeholder="name@rudraservices.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[44px] block w-full pl-10 pr-10 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] placeholder:text-[#666666] text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="min-h-[44px] min-w-[44px] absolute inset-y-0 right-0 flex items-center justify-center text-[#666666] hover:text-[#000000]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-[#111111] cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D6D6D6] bg-white text-[#111111] focus:ring-[#FACC15] w-4 h-4"
                />
                <span className="ml-2 font-medium text-[13px]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-[13px] text-[#111111] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] w-full py-3 px-4 bg-[#FACC15] hover:bg-[#FFD600] active:scale-[0.99] text-[#000000] font-bold text-[14px] sm:text-[15px] rounded-xl shadow-xs border border-[#EAB308] focus:outline-none focus:ring-2 focus:ring-[#000000] disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#000000]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In Helpers */}
          <div className="mt-6 pt-6 border-t border-[#D6D6D6]">
            <div className="text-center mb-4">
              <span className="text-xs text-[#666666] font-medium">New Field Recovery Officer? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-xs font-black text-[#111111] hover:text-[#000000] hover:underline cursor-pointer"
              >
                Register Account Here →
              </button>
            </div>
            <p className="text-[11px] font-black text-[#666666] uppercase tracking-wider text-center mb-3">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@rudraservices.com', 'admin123')}
                className="min-h-[40px] py-2 px-2 bg-[#111111] hover:bg-[#333333] rounded-xl text-xs font-black text-[#FFFFFF] border border-[#333333] transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('manager@rudraservices.com', 'manager123')}
                className="min-h-[40px] py-2 px-2 bg-[#FEF9C3] hover:bg-[#FACC15] rounded-xl text-xs font-black text-[#000000] border border-[#EAB308] transition-colors cursor-pointer"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('employee@rudraservices.com', 'employee123')}
                className="min-h-[40px] py-2 px-2 bg-[#F2F2F2] hover:bg-[#D6D6D6] rounded-xl text-xs font-bold text-[#111111] border border-[#D6D6D6] transition-colors cursor-pointer"
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
        <div className="space-y-4 text-[#111111] text-sm">
          <div className="p-3.5 bg-[#FEF9C3] rounded-xl border border-[#EAB308]/60 text-[#000000] text-xs font-medium">
            <p className="font-black mb-1 text-[#000000]">Administrative Access Security</p>
            For security compliance, password resets must be issued by a Rudra Services System Administrator.
          </div>
          <p className="font-medium text-[#666666]">Please contact your System Admin or IT Manager with your employee ID to reset credentials.</p>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowForgotModal(false)}
              className="min-h-[40px] px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
