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
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] antialiased transition-colors selection:bg-[#FACC15] selection:text-[#000000]">
      {/* 1. STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-[#D6D6D6] transition-colors shadow-xs">
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
                className="h-10 w-auto rounded-lg object-contain bg-white p-0.5 border border-[#D6D6D6] shadow-xs group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-base sm:text-lg font-black tracking-wide text-[#111111] flex items-center gap-1.5">
                  RUDRA SERVICES
                </span>
                <span className="block text-[10px] font-semibold text-[#666666] tracking-wider uppercase">
                  Vehicle Recovery Management
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-[#666666]">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-[#000000] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#000000] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#000000] transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('roles')}
                className="hover:text-[#000000] transition-colors cursor-pointer"
              >
                Roles & Portals
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-[#000000] transition-colors cursor-pointer"
              >
                About
              </button>
            </div>

            {/* Desktop Right Actions - Both Login and Register Visible */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate(getDashboardPath())}
                    className="min-h-[38px] px-4 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-[#EAB308]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#000000]" />
                    <span>{user.role} Portal</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="min-h-[38px] p-2 text-[#666666] hover:text-[#000000] hover:bg-[#F2F2F2] rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="min-h-[38px] px-4 py-2 bg-white hover:bg-[#F2F2F2] text-[#111111] hover:text-[#000000] border border-[#D6D6D6] hover:border-[#111111] rounded-lg text-xs font-black uppercase tracking-wider shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="min-h-[38px] px-4 py-2 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] rounded-lg text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#EAB308]"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#000000]" />
                    <span>Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#111111] hover:bg-[#F2F2F2] transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#D6D6D6] bg-white px-4 py-4 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-sm font-bold text-[#111111] hover:text-[#EAB308]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-bold text-[#111111] hover:text-[#EAB308]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-bold text-[#111111] hover:text-[#EAB308]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="block w-full text-left py-2 text-sm font-bold text-[#111111] hover:text-[#EAB308]"
            >
              Roles & Portals
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-sm font-bold text-[#111111] hover:text-[#EAB308]"
            >
              About
            </button>

            <div className="pt-3 border-t border-[#D6D6D6]">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate(getDashboardPath()); }}
                    className="w-full py-2.5 bg-[#FACC15] text-[#000000] font-black text-xs uppercase tracking-wider rounded-lg text-center shadow-xs"
                  >
                    Open {user.role} Dashboard
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="w-full py-2 bg-[#F2F2F2] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="w-full py-3 bg-[#111111] hover:bg-[#333333] text-white font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#FACC15]" />
                    <span>Login to Portal</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                    className="w-full py-3 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-xs border border-[#EAB308] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-[#000000]" />
                    <span>Register Field Officer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. TWO-COLUMN HERO SECTION */}
      <header className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Ambient Warm Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-[#FACC15]/10 via-[#FFD600]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Subtle Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FEF9C3] text-[#111111] border border-[#EAB308]/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
                <span>Vehicle Recovery Operations</span>
              </div>

              {/* Authoritative SaaS Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.12]">
                Smarter Vehicle Recovery.{' '}
                <span className="bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#FFD600] bg-clip-text text-transparent">
                  Simpler Operations.
                </span>
              </h1>

              {/* Clear Value Proposition Description */}
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed font-normal max-w-2xl">
                Streamline recovery cases, field operations, employee tracking, and financial reconciliation for vehicle finance and repossession teams with an enterprise-grade platform.
              </p>

              {/* Primary Dual Actions: Both Login & Register Clearly Visible */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="min-h-[50px] px-8 bg-[#111111] hover:bg-[#333333] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer border border-[#111111]"
                >
                  <Lock className="w-4 h-4 text-[#FACC15]" />
                  <span>Login to Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#FACC15] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="min-h-[50px] px-8 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] border border-[#EAB308] text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#000000]" />
                  <span>Register Account</span>
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="min-h-[50px] px-6 bg-white hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Direct Access for Both Roles & Portals */}
              <div className="p-3.5 rounded-xl bg-white border border-[#D6D6D6] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
                    Quick Role Access
                  </span>
                  <span className="text-[10px] text-[#000000] font-black uppercase tracking-wider bg-[#FEF9C3] px-2 py-0.5 rounded border border-[#EAB308]">
                    Direct Portals
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="p-2.5 rounded-lg bg-[#F8F8F8] hover:bg-[#FEF9C3] border border-[#D6D6D6] hover:border-[#EAB308] text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-black text-[#111111] group-hover:text-[#000000]">Admin</span>
                    <span className="block text-[10px] text-[#666666]">System Command →</span>
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="p-2.5 rounded-lg bg-[#F8F8F8] hover:bg-[#FEF9C3] border border-[#D6D6D6] hover:border-[#EAB308] text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-black text-[#111111] group-hover:text-[#000000]">Manager</span>
                    <span className="block text-[10px] text-[#666666]">Supervisor Console →</span>
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="p-2.5 rounded-lg bg-[#F8F8F8] hover:bg-[#FEF9C3] border border-[#D6D6D6] hover:border-[#EAB308] text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-black text-[#111111] group-hover:text-[#000000]">Field Officer</span>
                    <span className="block text-[10px] text-[#666666]">Ground Workspace →</span>
                  </button>
                </div>
              </div>

              {/* Trust Points / Key Value Badges */}
              <div className="pt-4 border-t border-[#D6D6D6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#666666] font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
                  <span>Role-Based Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
                  <span>Real-Time Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
                  <span>Excel Ingestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
                  <span>POS Reconciliation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic SaaS Product Preview */}
            <div className="lg:col-span-5 relative">
              {/* Glow Behind Mockup */}
              <div className="absolute -inset-1 bg-[#FACC15]/20 rounded-3xl blur-xl opacity-30 -z-10" />

              <div className="rounded-2xl border border-[#333333] bg-[#111111] text-white shadow-2xl overflow-hidden">
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1F1F1F] bg-[#000000] text-[#D6D6D6] text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#666666]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                    <span className="ml-2 text-[11px] text-[#D6D6D6] hidden sm:inline-block">
                      portal.rudraservices.com/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#000000] bg-[#FACC15] font-black px-2 py-0.5 rounded border border-[#EAB308]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#000000] animate-pulse" />
                    <span>Neon PostgreSQL Live</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Header with Illustrative Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FACC15] block">
                        LIVE OPERATIONS DASHBOARD
                      </span>
                      <h4 className="text-sm font-black text-white">Recovery Portfolio Snapshot</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1F1F1F] text-[#FACC15] border border-[#333333]">
                      Real-time
                    </span>
                  </div>

                  {/* Mini KPI Metric Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                      <span className="text-[10px] font-bold uppercase text-[#D6D6D6] block">Active Portfolio</span>
                      <span className="text-lg font-black text-white block mt-0.5">₹5,24,00,000</span>
                      <span className="text-[10px] text-[#FACC15] font-bold flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-[#FACC15]" /> +12.4% MoM
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                      <span className="text-[10px] font-bold uppercase text-[#D6D6D6] block">Collections</span>
                      <span className="text-lg font-black text-[#FACC15] block mt-0.5">₹36,22,000</span>
                      <span className="text-[10px] text-[#D6D6D6] font-medium block mt-0.5">34 Receipts Logged</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                      <span className="text-[10px] font-bold uppercase text-[#D6D6D6] block">Recovery Cases</span>
                      <span className="text-lg font-black text-white block mt-0.5">1,420 Active</span>
                      <span className="text-[10px] text-[#FACC15] font-bold block mt-0.5">48 Critical DPD</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                      <span className="text-[10px] font-bold uppercase text-[#D6D6D6] block">Resolution Rate</span>
                      <span className="text-lg font-black text-white block mt-0.5">94.2%</span>
                      <span className="text-[10px] text-[#FACC15] font-medium block mt-0.5">18 Field Officers</span>
                    </div>
                  </div>

                  {/* Mini Case Row Preview */}
                  <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#D6D6D6] font-bold uppercase tracking-wider">Recent Case Allocation</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FEF9C3] text-[#000000] border border-[#EAB308]">
                        ALLOCATED
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-white block">Ramesh Kumar</span>
                        <span className="text-[11px] font-mono text-[#D6D6D6]">PROP10001 • Tata Ace Gold</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#FACC15] block">₹2,50,000</span>
                        <span className="text-[10px] text-[#D6D6D6] font-semibold">60 DPD (BOM 2)</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Recent Activity Card */}
                  <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#333333] space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#D6D6D6] block">Ground Field Stream</span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-[#FFFFFF]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
                          <span>Follow-up logged for MH-12-CD-5678</span>
                        </span>
                        <span className="text-[10px] text-[#666666] font-mono">2m ago</span>
                      </div>
                      <div className="flex items-center justify-between text-[#FFFFFF]">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
                          <span>Payment collected: ₹25,000 (UPI)</span>
                        </span>
                        <span className="text-[10px] text-[#666666] font-mono">14m ago</span>
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
          <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
            Comprehensive Features Built for Recovery Operations
          </h2>
          <p className="text-sm sm:text-base text-[#666666] font-medium">
            Purpose-built tooling designed specifically for auto lenders, NBFCs, repossession agencies, and field recovery teams.
          </p>
        </div>

        {/* 6 Core Feature Cards in 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Recovery Cases Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Recovery Cases Management
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Track vehicle recovery proposals from allocation to closure, with DPD buckets, POS amounts, vehicle registration, and multi-stage status workflows.
            </p>
          </div>

          {/* Feature 2: Employee & Team Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Employee & Team Management
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Role-based hierarchy with Admin, Manager, and Field Employee roles. Account verification, status controls, and granular field performance monitoring.
            </p>
          </div>

          {/* Feature 3: Intelligent Excel Management */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Intelligent Excel Management
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Upload lender and bank portfolio spreadsheets with automated column mapping, validation, duplicate prevention, and zero data loss on existing records.
            </p>
          </div>

          {/* Feature 4: Smart Assignment & Dispatch */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Smart Assignment & Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Allocate recovery cases to field executives based on area, priority, and workload with real-time assignment history tracking and audit accountability.
            </p>
          </div>

          {/* Feature 5: Field Follow-ups & Notes */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Field Follow-ups & Notes
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Record ground visits, customer responses, promise-to-pay (PTP) dates, vehicle location pins, and contact logs in real time from mobile devices.
            </p>
          </div>

          {/* Feature 6: Payment Tracking & Receipts */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D6D6D6] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#FACC15] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">
              Payment Tracking & Receipts
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
              Log field collections, reference numbers, payment modes, receipt issuance, and instant balance reconciliation against outstanding POS.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS / WORKFLOW SECTION */}
      <section id="how-it-works" className="py-20 bg-[#FAFAFA]/80 border-y border-[#D6D6D6] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">
              Operational Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
              How Rudra Services Powers the Recovery Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-[#666666] font-medium">
              From initial raw portfolio import to field investigation and banking balance reconciliation.
            </p>
          </div>

          {/* 5-Step Connected Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Desktop Connector Line Behind Cards */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#FFD600] -translate-y-8 -z-0 opacity-40" />

            {/* Step 1: Import Portfolio */}
            <div className="relative z-10 bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111111] font-mono">
                  STEP 01
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] text-[#000000] flex items-center justify-center border border-[#EAB308]/40">
                  <UploadCloud className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                Import Portfolio
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-normal">
                Upload Excel spreadsheets from banks and NBFCs with loan details, customer info, and vehicle data.
              </p>
            </div>

            {/* Step 2: Review & Triage */}
            <div className="relative z-10 bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111111] font-mono">
                  STEP 02
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] text-[#000000] flex items-center justify-center border border-[#EAB308]/40">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                Review & Triage
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-normal">
                Admin and Managers analyze DPD buckets, categorize risk levels, and organize recovery targets.
              </p>
            </div>

            {/* Step 3: Assign Field Officers */}
            <div className="relative z-10 bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111111] font-mono">
                  STEP 03
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] text-[#000000] flex items-center justify-center border border-[#EAB308]/40">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                Assign Field Officers
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-normal">
                Cases are assigned to verified field executives with clear instructions, priority tags, and location info.
              </p>
            </div>

            {/* Step 4: Execute Field Operations */}
            <div className="relative z-10 bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111111] font-mono">
                  STEP 04
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] text-[#000000] flex items-center justify-center border border-[#EAB308]/40">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                Execute Operations
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-normal">
                Officers conduct visits, log interaction notes, record PTP commitments, and collect field dues.
              </p>
            </div>

            {/* Step 5: Resolve & Reconcile */}
            <div className="relative z-10 bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111111] font-mono">
                  STEP 05
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] text-[#000000] flex items-center justify-center border border-[#EAB308]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                Resolve & Reconcile
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-normal">
                Track payments, update case statuses (Recovered, Settled, Closed), and generate operational reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE-BASED ACCESS SECTION ("Built for Every Stakeholder") */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">
            Role-Based Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
            Built for Your Recovery Team
          </h2>
          <p className="text-sm sm:text-base text-[#666666] font-medium">
            Strict Role-Based Access Control (RBAC) ensures executive leaders, field supervisors, and ground agents have the exact tools and permissions they need.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: ADMIN */}
          <div className="rounded-2xl bg-white border border-[#D6D6D6] p-7 shadow-sm hover:shadow-md hover:border-[#FACC15] transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#111111] text-[#FFFFFF] border border-[#333333]">
                  EXECUTIVE ADMIN
                </span>
                <ShieldCheck className="w-5 h-5 text-[#111111]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#111111]">Admin Command Portal</h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Complete system governance, master file ingestion, and operational performance supervision.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-[#D6D6D6] text-xs text-[#111111] font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>User verification, approval, rejection, and access disabling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Bulk Excel portfolio import with non-destructive UPSERTs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Global case allocation, reassignment, and priority overrides</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Comprehensive institutional financial reports & Excel exports</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#D6D6D6]">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#FACC15]" />
              </button>
            </div>
          </div>

          {/* Card 2: MANAGER */}
          <div className="rounded-2xl bg-white border border-[#D6D6D6] p-7 shadow-sm hover:shadow-md hover:border-[#FACC15] transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FEF9C3] text-[#000000] border border-[#EAB308]">
                  ZONAL MANAGER
                </span>
                <Briefcase className="w-5 h-5 text-[#EAB308]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#111111]">Supervisor Console</h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Zonal team leadership, case distribution, ground follow-up auditing, and collection review.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-[#D6D6D6] text-xs text-[#111111] font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Targeted recovery case allocation to active field officers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Monitor live ground follow-up notes & PTP commitments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Review and verify field collection receipts against POS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Analyze officer recovery percentages and DPD resolutions</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#D6D6D6]">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Manager</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#FACC15]" />
              </button>
            </div>
          </div>

          {/* Card 3: EMPLOYEE */}
          <div className="rounded-2xl bg-white border border-[#D6D6D6] p-7 shadow-sm hover:shadow-md hover:border-[#FACC15] transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6]">
                  FIELD EMPLOYEE
                </span>
                <Users className="w-5 h-5 text-[#111111]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#111111]">Field Agent Workspace</h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Mobile-optimized ground workbench to locate debtors, log visit telemetry, and collect dues.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-[#D6D6D6] text-xs text-[#111111] font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Direct view of assigned recovery cases with borrower dossier</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Instant ground follow-up entry with PTP date selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Issue digital payment collection receipts (Cash/UPI/Bank)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                  <span>Track personal resolution KPIs and monthly recovery ranking</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#D6D6D6] space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full min-h-[40px] px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Field Officer</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#000000]" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full min-h-[38px] px-4 py-2 bg-white hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] hover:border-[#111111] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>New Officer? Register Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY RUDRA SERVICES / VALUE PROPOSITION SECTION */}
      <section id="about" className="py-20 bg-[#FAFAFA]/80 border-t border-[#D6D6D6] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">
              Enterprise Trust & Reliability
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
              Why Leading Recovery Teams Choose Rudra Services
            </h2>
            <p className="text-sm sm:text-base text-[#666666] font-medium">
              Built specifically to eliminate untracked phone calls, duplicate spreadsheets, and reconciliation disputes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#D6D6D6] space-y-3 shadow-xs hover:border-[#FACC15] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#111111]">Zero Data Loss</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Robust PostgreSQL storage ensuring every case, payment, and audit log is permanently preserved with non-destructive UPSERTs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D6D6D6] space-y-3 shadow-xs hover:border-[#FACC15] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#111111]">Role-Enforced Security</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Strict RBAC preventing unauthorized data access between field agents, managers, and institutional administrators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D6D6D6] space-y-3 shadow-xs hover:border-[#FACC15] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#111111]">Audit-Ready Operations</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Complete history of every case status transition, employee assignment, and financial collection receipt.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D6D6D6] space-y-3 shadow-xs hover:border-[#FACC15] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#EAB308]/40 text-[#000000] flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#111111]">Mobile-First for Field Teams</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Fully responsive interface allowing field officers to log borrower interactions and issue receipts on smartphones in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#000000] via-[#111111] to-[#1F1F1F] border border-[#333333] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Streamline Your Vehicle Recovery Operations?
            </h2>
            <p className="text-sm sm:text-base text-[#D6D6D6] font-medium leading-relaxed max-w-2xl mx-auto">
              Join recovery agencies and finance teams managing portfolios with precision, accountability, and speed.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#EAB308]"
              >
                <Lock className="w-4 h-4 text-[#000000]" />
                <span>Login to Portal</span>
                <ArrowRight className="w-4 h-4 text-[#000000]" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-white hover:bg-[#F2F2F2] text-[#111111] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#D6D6D6]"
              >
                <UserCheck className="w-4 h-4 text-[#111111]" />
                <span>Register Field Account</span>
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-[#1F1F1F] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-[#333333] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE FOOTER */}
      <footer className="border-t border-[#D6D6D6] bg-white py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3 text-left">
            <img
              src="/rudra-logo.jpg"
              alt="Rudra Services"
              className="h-9 w-auto rounded-lg object-contain bg-white p-0.5 border border-[#D6D6D6]"
            />
            <div>
              <span className="font-extrabold text-sm text-[#111111] block">
                RUDRA SERVICES
              </span>
              <p className="text-[11px] text-[#666666]">
                Vehicle Recovery Management System
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#666666] font-bold uppercase tracking-wider">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#000000] transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#000000] transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#000000] transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-[#000000] transition-colors cursor-pointer">
              Roles
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-[#000000] transition-colors cursor-pointer">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="hover:text-[#000000] text-[#111111] font-black transition-colors cursor-pointer">
              Register
            </button>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF9C3] text-[#000000] border border-[#EAB308]/60">
              <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#D6D6D6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] gap-4">
          <p>© 2025 Rudra Services. Vehicle Recovery Management System. All rights reserved.</p>
          <p className="font-mono text-[11px]">Powered by Neon PostgreSQL • React • Node.js</p>
        </div>
      </footer>
    </div>
  );
};
export default Home;
