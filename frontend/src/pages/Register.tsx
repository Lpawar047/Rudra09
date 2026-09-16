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
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top bar theme switcher & login link */}
      <div className="absolute top-5 right-5 sm:right-8 flex items-center gap-3 z-20">
        <Link
          to="/login"
          className="text-xs font-bold text-[#666666] hover:text-[#000000] transition-colors"
        >
          ← Back to Login
        </Link>
        <ThemeToggle variant="button" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs border border-[#D6D6D6] inline-block">
            <img src="/rudra-logo.jpg" alt="Rudra Services" className="h-14 w-auto object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] tracking-tight">RUDRA SERVICES</h2>
        <p className="mt-1 text-[12px] text-[#EAB308] font-bold uppercase tracking-wider">
          Field Officer Registration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#D6D6D6] py-8 px-6 shadow-md rounded-2xl sm:px-10">
          {/* Dual Options: Sign In & Register Always Visible */}
          <div className="flex rounded-xl bg-[#F2F2F2] p-1 mb-6 border border-[#D6D6D6]">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg text-[#666666] hover:text-[#000000] hover:bg-white/60 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              className="flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg bg-white text-[#111111] shadow-xs border border-[#D6D6D6]"
            >
              Register New Account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#FEF9C3] border border-[#EAB308] p-3 rounded-xl flex items-center gap-2 text-[#000000] font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EAB308]" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none placeholder:text-[#666666]"
                placeholder="e.g. Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none placeholder:text-[#666666]"
                placeholder="officer@rudraservices.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none placeholder:text-[#666666]"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none"
                >
                  <option value="Field Recovery">Field Recovery</option>
                  <option value="Vehicle Repo">Vehicle Repo</option>
                  <option value="Legal & Notice">Legal & Notice</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none placeholder:text-[#666666]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#111111] uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-lg text-[#111111] text-[14px] font-normal focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none placeholder:text-[#666666]"
                placeholder="••••••••"
              />
            </div>

            <div className="p-3.5 bg-[#FEF9C3] border border-[#EAB308] rounded-xl text-xs text-[#000000] font-medium">
              ℹ️ Your registration will be created with status <strong className="font-bold text-[#000000]">PENDING</strong> and requires Admin approval before you can access the system.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] w-full py-3 bg-[#FACC15] hover:bg-[#FFD600] active:scale-[0.99] text-[#000000] border border-[#EAB308] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-[14px] sm:text-[15px] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'} <ArrowRight className="w-4 h-4 text-[#000000]" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#D6D6D6] pt-4 text-xs font-medium">
            <span className="text-[#666666]">Already registered? </span>
            <Link to="/login" className="text-[#111111] font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
