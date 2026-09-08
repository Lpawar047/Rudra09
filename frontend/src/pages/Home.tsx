import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileSpreadsheet,
  Truck,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Lock,
  ChevronRight,
  BarChart3,
  PhoneCall,
  MapPin,
  FileText,
  Activity,
  Database,
  Menu,
  X,
  UserCheck,
  Check,
  Shield,
  Briefcase,
  UploadCloud,
  FileCheck2,
  PieChart,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'MANAGER') return '/manager/dashboard';
    return '/employee/dashboard';
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-white antialiased transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 1. STICKY GLASSMORPHISM NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-[#E2E8F0] dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/rudra-logo.jpg"
                alt="Rudra Services"
                className="h-10 w-auto rounded-lg object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-base sm:text-lg font-black tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                  RUDRA SERVICES
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  Vehicle Recovery Management
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('roles')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Roles & Portals
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                About
              </button>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate(getDashboardPath())}
                    className="min-h-[38px] px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{user.role} Portal</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="min-h-[38px] p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="min-h-[38px] px-5 py-2 bg-gradient-to-r from-indigo-900 via-indigo-600 to-blue-600 hover:opacity-95 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              Roles & Portals
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              About
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate(getDashboardPath()); }}
                    className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-lg text-center"
                  >
                    Open {user.role} Dashboard
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-lg text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-900 via-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-lg text-center shadow-sm"
                >
                  Login to Portal
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. PREMIUM TWO-COLUMN HERO SECTION */}
      <header className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Subtle Ambient Lighting Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-indigo-500/10 via-blue-500/5 to-cyan-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Subtle Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Vehicle Recovery Operations</span>
              </div>

              {/* Authoritative SaaS Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Smarter Vehicle Recovery.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Simpler Operations.
                </span>
              </h1>

              {/* Clear Value Proposition Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
                Streamline recovery cases, field operations, employee tracking, and financial reconciliation for vehicle finance and repossession teams with an enterprise-grade platform.
              </p>

              {/* CTA Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => scrollToSection('features')}
                  className="min-h-[48px] px-7 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Features</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="min-h-[48px] px-7 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>How It Works</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="min-h-[48px] px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Access Portal</span>
                </button>
              </div>

              {/* Trust Points / Key Value Badges */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Role-Based Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-Time Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Excel Ingestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>POS Reconciliation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic SaaS Product Preview */}
            <div className="lg:col-span-5 relative">
              {/* Glow Behind Mockup */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-20 dark:opacity-30 -z-10" />

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-2xl overflow-hidden">
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/80 text-slate-400 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] text-slate-400 hidden sm:inline-block">
                      portal.rudraservices.com/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Neon PostgreSQL Live</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Header with Illustrative Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                        LIVE OPERATIONS DASHBOARD
                      </span>
                      <h4 className="text-sm font-black text-white">Recovery Portfolio Snapshot</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                      Real-time
                    </span>
                  </div>

                  {/* Mini KPI Metric Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Portfolio</span>
                      <span className="text-lg font-black text-white block mt-0.5">₹5,24,00,000</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> +12.4% MoM
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Collections</span>
                      <span className="text-lg font-black text-emerald-400 block mt-0.5">₹36,22,000</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">34 Receipts Logged</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Recovery Cases</span>
                      <span className="text-lg font-black text-indigo-300 block mt-0.5">1,420 Active</span>
                      <span className="text-[10px] text-amber-400 font-bold block mt-0.5">48 Critical DPD</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Resolution Rate</span>
                      <span className="text-lg font-black text-white block mt-0.5">94.2%</span>
                      <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">18 Field Officers</span>
                    </div>
                  </div>

                  {/* Mini Case Row Preview */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Recent Case Allocation</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        ALLOCATED
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-white block">Ramesh Kumar</span>
                        <span className="text-[11px] font-mono text-indigo-400">PROP10001 • Tata Ace Gold</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white block">₹2,50,000</span>
                        <span className="text-[10px] text-amber-400 font-semibold">60 DPD (BOM 2)</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Recent Activity Card */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Ground Field Stream</span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Follow-up logged for MH-12-CD-5678</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">2m ago</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Payment collected: ₹25,000 (UPI)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">14m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURES SECTION ("Platform Capabilities") */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive Features Built for Recovery Operations
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Purpose-built tooling designed specifically for auto lenders, NBFCs, repossession agencies, and field recovery teams.
          </p>
        </div>

        {/* 6 Core Feature Cards in 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Recovery Cases Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Recovery Cases Management
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Track vehicle recovery proposals from allocation to closure, with DPD buckets, POS amounts, vehicle registration, and multi-stage status workflows.
            </p>
          </div>

          {/* Feature 2: Employee & Team Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Employee & Team Management
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Role-based hierarchy with Admin, Manager, and Field Employee roles. Account verification, status controls, and granular field performance monitoring.
            </p>
          </div>

          {/* Feature 3: Intelligent Excel Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Intelligent Excel Management
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Upload lender and bank portfolio spreadsheets with automated column mapping, validation, duplicate prevention, and zero data loss on existing records.
            </p>
          </div>

          {/* Feature 4: Smart Assignment & Dispatch */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200/60 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Smart Assignment & Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Allocate recovery cases to field executives based on area, priority, and workload with real-time assignment history tracking and audit accountability.
            </p>
          </div>

          {/* Feature 5: Field Follow-ups & Notes */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Field Follow-ups & Notes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Record ground visits, customer responses, promise-to-pay (PTP) dates, vehicle location pins, and contact logs in real time from mobile devices.
            </p>
          </div>

          {/* Feature 6: Payment Tracking & Receipts */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200/60 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              Payment Tracking & Receipts
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Log field collections, reference numbers, payment modes, receipt issuance, and instant balance reconciliation against outstanding POS.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS / WORKFLOW SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Operational Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How Rudra Services Powers the Recovery Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              From initial raw portfolio import to field investigation and banking balance reconciliation.
            </p>
          </div>

          {/* 5-Step Connected Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Desktop Connector Line Behind Cards */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 -translate-y-8 -z-0 opacity-40" />

            {/* Step 1: Import Portfolio */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  STEP 01
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Import Portfolio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Upload Excel spreadsheets from banks and NBFCs with loan details, customer info, and vehicle data.
              </p>
            </div>

            {/* Step 2: Review & Triage */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                  STEP 02
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Review & Triage
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Admin and Managers analyze DPD buckets, categorize risk levels, and organize recovery targets.
              </p>
            </div>

            {/* Step 3: Assign Field Officers */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                  STEP 03
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Assign Field Officers
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Cases are assigned to verified field executives with clear instructions, priority tags, and location info.
              </p>
            </div>

            {/* Step 4: Execute Field Operations */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                  STEP 04
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Execute Operations
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Officers conduct visits, log interaction notes, record PTP commitments, and collect field dues.
              </p>
            </div>

            {/* Step 5: Resolve & Reconcile */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  STEP 05
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Resolve & Reconcile
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Track payments, update case statuses (Recovered, Settled, Closed), and generate operational reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE-BASED ACCESS SECTION ("Built for Every Stakeholder") */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Role-Based Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Your Recovery Team
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Strict Role-Based Access Control (RBAC) ensures executive leaders, field supervisors, and ground agents have the exact tools and permissions they need.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: ADMIN */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  EXECUTIVE ADMIN
                </span>
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Admin Command Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Complete system governance, master file ingestion, and operational performance supervision.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>User verification, approval, rejection, and access disabling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bulk Excel portfolio import with non-destructive UPSERTs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Global case allocation, reassignment, and priority overrides</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Comprehensive institutional financial reports & Excel exports</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: MANAGER */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ZONAL MANAGER
                </span>
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Supervisor Console</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Zonal team leadership, case distribution, ground follow-up auditing, and collection review.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Targeted recovery case allocation to active field officers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Monitor live ground follow-up notes & PTP commitments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Review and verify field collection receipts against POS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Analyze officer recovery percentages and DPD resolutions</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Manager</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: EMPLOYEE */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  FIELD EMPLOYEE
                </span>
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Field Agent Workspace</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Mobile-optimized ground workbench to locate debtors, log visit telemetry, and collect dues.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Direct view of assigned recovery cases with borrower dossier</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Instant ground follow-up entry with PTP date selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Issue digital payment collection receipts (Cash/UPI/Bank)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Track personal resolution KPIs and monthly recovery ranking</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Field Officer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY RUDRA SERVICES / VALUE PROPOSITION SECTION */}
      <section id="about" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Enterprise Trust & Reliability
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why Leading Recovery Teams Choose Rudra Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Built specifically to eliminate untracked phone calls, duplicate spreadsheets, and reconciliation disputes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Zero Data Loss</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Robust PostgreSQL storage ensuring every case, payment, and audit log is permanently preserved with non-destructive UPSERTs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Role-Enforced Security</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict RBAC preventing unauthorized data access between field agents, managers, and institutional administrators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Audit-Ready Operations</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Complete history of every case status transition, employee assignment, and financial collection receipt.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Mobile-First for Field Teams</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fully responsive interface allowing field officers to log borrower interactions and issue receipts on smartphones in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#2563EB] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Streamline Your Vehicle Recovery Operations?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed max-w-2xl mx-auto">
              Join recovery agencies and finance teams managing portfolios with precision, accountability, and speed.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Portal / Login</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-indigo-950/40 hover:bg-indigo-950/70 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3 text-left">
            <img
              src="/rudra-logo.jpg"
              alt="Rudra Services"
              className="h-9 w-auto rounded-lg object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700"
            />
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                RUDRA SERVICES
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Vehicle Recovery Management System
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Roles
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Login
            </button>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2025 Rudra Services. Vehicle Recovery Management System. All rights reserved.</p>
          <p className="font-mono text-[11px]">Powered by Neon PostgreSQL • React • Node.js</p>
        </div>
      </footer>
    </div>
  );
};
export default Home;
