import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  Lock,
  LayoutDashboard,
  LogOut,
  Shield,
  Users,
  Clock,
  FileSpreadsheet,
  ArrowUp,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── 0. LOGO COMPONENT ───────────────────────────────────────────────────────
const RudraLogo: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => (
  <div
    className={`relative flex items-center justify-center rounded-lg bg-[#222222] border border-[#333333] text-white select-none shrink-0 ${className}`}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <div className="absolute top-1.5 bottom-1.5 left-1 w-[2px] bg-[#FFD600] rounded-full" />
    <span className="font-bold text-sm tracking-tight text-white pl-1 font-mono">
      R
    </span>
  </div>
);

// ─── 1. ABSTRACT GEOMETRIC HERO GRAPHIC ──────────────────────────────────────
const AbstractHeroGraphic: React.FC = () => {
  return (
    <div
      className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-[4/3] mx-auto select-none"
      aria-hidden="true"
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-radial from-[#FACC15]/10 via-transparent to-transparent rounded-2xl blur-xl" />

      {/* Frame Container */}
      <div className="relative w-full h-full rounded-2xl border border-[#2B2B2B] bg-[#161616]/80 p-5 sm:p-6 backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 hero-grid-pattern opacity-40 pointer-events-none" />

        {/* Scanning Coordinate Accent Line */}
        <div className="absolute left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#FFD600] to-transparent animate-line-scan pointer-events-none opacity-70" />

        {/* Top Header / Coordinate Markers */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#666666] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
            <span className="text-[#A3A3A3]">SYS.01 // OPS_GRID</span>
          </div>
          <span className="text-[#666666]">NASHIK 20.00°N</span>
        </div>

        {/* Center: Abstract Architectural "R" Geometric Wireframe */}
        <div className="relative z-10 my-auto flex items-center justify-center py-2">
          <svg
            viewBox="0 0 160 160"
            className="w-32 h-32 sm:w-36 sm:h-36 text-white stroke-current fill-none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Background Reference Crosshairs */}
            <line x1="80" y1="10" x2="80" y2="150" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="80" x2="150" y2="80" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="80" cy="80" r="60" stroke="#262626" strokeWidth="1" />

            {/* Geometric "R" Monogram Path */}
            <path
              d="M 45 130 L 45 30 L 95 30 C 112 30 120 42 120 55 C 120 68 112 80 95 80 L 45 80 M 85 80 L 122 130"
              stroke="#FFFFFF"
              strokeWidth="4"
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            />

            {/* Accent Golden Yellow Indicator Line & Vertex Points */}
            <line x1="45" y1="30" x2="45" y2="130" stroke="#FFD600" strokeWidth="4" />
            <circle cx="45" cy="30" r="3.5" fill="#FFD600" />
            <circle cx="45" cy="80" r="3.5" fill="#FFD600" />
            <circle cx="95" cy="30" r="3" fill="#FFFFFF" />
            <circle cx="120" cy="55" r="3" fill="#FFFFFF" />
            <circle cx="95" cy="80" r="3" fill="#FFFFFF" />
            <circle cx="122" cy="130" r="3.5" fill="#FFD600" />
          </svg>
        </div>

        {/* Bottom Status Tickers */}
        <div className="relative z-10 pt-2 border-t border-[#262626] flex items-center justify-between text-[10px] font-mono text-[#666666]">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-3 bg-[#FFD600] rounded-xs" />
            <span className="text-[#A3A3A3]">PORTFOLIO READY</span>
          </span>
          <span className="text-[#666666] tabular-nums">LATENCY &lt; 15MS</span>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN HOME COMPONENT ────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Section Observer Refs for Scroll Reveals
  const aboutRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const whyUsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    home: true,
  });

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'MANAGER') return '/manager/dashboard';
    return '/employee/dashboard';
  };

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath());
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath());
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 70;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Track scroll position for navbar style & active section
  useEffect(() => {
    const handleScroll = () => {
      // Navbar scroll styling
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section spy
      const sections = ['home', 'about', 'features', 'how-it-works', 'why-us'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        if (sectionId === 'home' && window.scrollY < 200) {
          setActiveSection('home');
          break;
        }
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for subtle scroll reveals & step highlighting
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    });

    const targets = [aboutRef.current, featuresRef.current, howItWorksRef.current, whyUsRef.current, ctaRef.current];
    targets.forEach((target) => {
      if (target) observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  // Cycle active step subtly or on interval for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-[#111111] font-sans antialiased selection:bg-[#FFD600] selection:text-[#111111] overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVBAR (Sticky, 70px High, Clean & Scroll Adaptive)
      ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Main Navigation"
        className={`sticky top-0 z-50 h-[70px] transition-all duration-200 ${
          isScrolled
            ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#2D2D2D] shadow-md shadow-black/20'
            : 'bg-[#111111] border-b border-[#262626] shadow-none'
        }`}
      >
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: R logo + RUDRA SERVICES + RECOVERY & REPO PLATFORM */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            tabIndex={0}
            role="button"
            aria-label="Rudra Services Home"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') scrollToSection('home');
            }}
          >
            <RudraLogo size={36} />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold tracking-wider text-white uppercase leading-tight group-hover:text-white transition-colors">
                RUDRA SERVICES
              </span>
              <span className="text-[9px] font-medium text-[#666666] tracking-widest uppercase">
                Recovery & Repo Platform
              </span>
            </div>
          </div>

          {/* CENTER: Home, About, Features, How It Works, Why Us */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A3A3A3]">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'why-us', label: 'Why Us' },
            ].map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative py-2 transition-colors cursor-pointer hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-[#A3A3A3]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD600] rounded-full transition-all duration-200" />
                  ) : (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD600] scale-x-0 hover:scale-x-100 transition-transform duration-150 origin-left" />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT: LOGIN & GET STARTED */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="min-h-[44px] px-5 bg-[#FFD600] hover:bg-[#FACC15] active:scale-[0.98] text-[#111111] rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#111111]" />
                  <span>{user.role} Portal</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="min-h-[44px] w-11 flex items-center justify-center text-[#666666] hover:text-white bg-[#1A1A1A] border border-[#262626] hover:border-[#404040] rounded-lg transition-colors cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* LOGIN: Clean transparent button with border */}
                <button
                  onClick={handleLogin}
                  className="min-h-[44px] px-5 bg-transparent hover:bg-[#1A1A1A] text-white border border-[#333333] hover:border-[#666666] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  LOGIN
                </button>
                {/* GET STARTED: Yellow background, black text, subtle hover movement */}
                <button
                  onClick={handleGetStarted}
                  className="group min-h-[44px] px-5 bg-[#FFD600] hover:bg-[#FACC15] active:scale-[0.98] text-[#111111] rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>GET STARTED</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#111111] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button (min 44px touch target) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white bg-[#1A1A1A] border border-[#262626] hover:border-[#404040] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#262626] bg-[#0E0E0E] px-4 py-5 space-y-2 shadow-2xl animate-in fade-in duration-200">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'why-us', label: 'Why Us' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`min-h-[44px] w-full text-left px-3.5 flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'bg-[#1C1C1C] text-white border-l-2 border-[#FFD600]'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-[#262626] space-y-2.5">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(getDashboardPath());
                    }}
                    className="w-full min-h-[44px] bg-[#FFD600] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    Open {user.role} Portal
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full min-h-[44px] bg-[#1A1A1A] text-white border border-[#262626] font-semibold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleGetStarted();
                    }}
                    className="w-full min-h-[44px] bg-[#FFD600] hover:bg-[#FACC15] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>GET STARTED</span>
                    <ArrowRight className="w-4 h-4 text-[#111111]" />
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogin();
                    }}
                    className="w-full min-h-[44px] bg-transparent text-white border border-[#333333] hover:border-[#666666] font-semibold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#A3A3A3]" />
                    <span>LOGIN</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION (Black Theme, Geometric Visual, Photo-Free)
        ───────────────────────────────────────────────────────────── */}
        <header
          id="home"
          className="relative py-16 sm:py-24 lg:py-28 bg-[#111111] text-white border-b border-[#262626] flex items-center justify-center text-center overflow-hidden"
        >
          {/* Subtle Radial Gradient Accent in Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-radial from-[#FFD600]/5 via-transparent to-transparent pointer-events-none blur-3xl" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-7 relative z-10 w-full">
            {/* Eyebrow: Small Yellow Line */}
            <div className="w-12 h-1 bg-[#FFD600] mx-auto rounded-full" />

            {/* Main Heading: RECOVER (white) MOVE (yellow) FORWARD (white) */}
            <h1 className="text-[34px] min-[375px]:text-[38px] sm:text-[46px] lg:text-[56px] font-extrabold tracking-tight leading-[1.1] uppercase max-w-3xl mx-auto break-words">
              RECOVER. <span className="text-[#FFD600]">MOVE.</span> FORWARD.
            </h1>

            {/* Subheading text */}
            <p className="text-sm min-[375px]:text-base sm:text-lg text-[#A3A3A3] max-w-xl mx-auto leading-relaxed px-2 font-normal">
              A simple platform for managing vehicle recovery and field operations.
            </p>

            {/* Centered Buttons: comfortable side-by-side on sm+, stacked on mobile */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
              <button
                onClick={handleGetStarted}
                className="group w-full sm:w-auto min-h-[48px] px-8 bg-[#FFD600] hover:bg-[#FACC15] active:scale-[0.98] text-[#111111] font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 text-[#111111] transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-transparent hover:bg-[#1A1A1A] text-white border border-[#404040] hover:border-white font-semibold text-sm uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <span>LOGIN</span>
              </button>
            </div>

            {/* Hero Abstract Geometric Design */}
            <div className="pt-4 sm:pt-6">
              <AbstractHeroGraphic />
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            3. ABOUT SECTION (WHITE Background, Simple, 4 Interactive Cards)
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={aboutRef}
          id="about"
          className="py-18 sm:py-24 bg-[#FFFFFF] text-[#111111] border-b border-[#E5E5E5] transition-all duration-300"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header: ABOUT RUDRA SERVICES & Simple recovery operations. */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#666666] tracking-widest uppercase block">
                ABOUT RUDRA SERVICES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
                Simple recovery operations.
              </h2>
              <p className="text-sm sm:text-base text-[#666666] leading-relaxed pt-1 max-w-xl mx-auto">
                Rudra Services simplifies vehicle recovery by bringing cases, field teams, follow-ups, and portfolio data into one clear workspace.
              </p>
            </div>

            {/* 4 Interactive Elements: CASES, TEAMS, FOLLOW-UPS, DATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  id: 'cases',
                  title: 'CASES',
                  desc: 'Delinquent vehicle loan portfolio management and recovery tracking.',
                },
                {
                  id: 'teams',
                  title: 'TEAMS',
                  desc: 'Field officer delegation and Nashik territory coordination.',
                },
                {
                  id: 'followups',
                  title: 'FOLLOW-UPS',
                  desc: 'Structured borrower contact, visit logs, and promise to pay.',
                },
                {
                  id: 'data',
                  title: 'DATA',
                  desc: 'High-volume Excel ingestion, validation, and status updates.',
                },
              ].map((item, idx) => (
                <div
                  key={item.id}
                  className={`group relative p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default flex flex-col justify-between space-y-3 ${
                    visibleSections['about'] ? 'opacity-100 translate-y-0' : 'opacity-90'
                  }`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#666666] group-hover:text-[#111111] transition-colors">
                        0{idx + 1}
                      </span>
                      {/* Interactive Accent Dot */}
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#FFD600] transition-colors duration-200" />
                    </div>
                    <h3 className="text-base font-bold text-[#111111] tracking-wide uppercase">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Interactive Accent Line that appears/slides on hover */}
                  <div className="w-full h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#FFD600] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. FEATURES SECTION (LIGHT GRAY Background, 4 Clean Cards)
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={featuresRef}
          id="features"
          className="py-18 sm:py-24 bg-[#F5F5F5] text-[#111111] border-b border-[#E5E5E5]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header: WHAT YOU CAN DO & Everything your team needs. */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2">
              <span className="text-xs font-bold text-[#666666] tracking-widest uppercase block">
                WHAT YOU CAN DO
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
                Everything your team needs.
              </h2>
            </div>

            {/* 4 Cards: RECOVERY CASES, TEAM MANAGEMENT, FOLLOW-UPS, EXCEL IMPORT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                {
                  id: 'recovery-cases',
                  title: 'RECOVERY CASES',
                  sub: 'Recovery Cases',
                  desc: 'Track and organize overdue vehicle loans across all recovery stages.',
                  icon: Shield,
                },
                {
                  id: 'team-management',
                  title: 'TEAM MANAGEMENT',
                  sub: 'Team Management',
                  desc: 'Supervise field recovery agents and assign accounts by territory.',
                  icon: Users,
                },
                {
                  id: 'follow-ups',
                  title: 'FOLLOW-UPS',
                  sub: 'Follow-ups',
                  desc: 'Log field interactions, calls, and promises to pay in real time.',
                  icon: Clock,
                },
                {
                  id: 'excel-import',
                  title: 'EXCEL IMPORT',
                  sub: 'Excel Import',
                  desc: 'Ingest thousands of bank loan records with automated validation.',
                  icon: FileSpreadsheet,
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className={`group relative p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#FFD600] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 transition-all duration-200 flex flex-col justify-between space-y-4 cursor-default ${
                      visibleSections['features'] ? 'opacity-100 translate-y-0' : 'opacity-90'
                    }`}
                    style={{ transitionDelay: `${idx * 60}ms` }}
                  >
                    <div className="space-y-3.5">
                      {/* Icon Container: shifts slightly on hover */}
                      <div className="w-10 h-10 rounded-lg bg-[#111111] text-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[#111111] tracking-tight">
                        {card.sub}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Bottom: Arrow icon that slides right on hover */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <span className="text-[11px] font-mono font-bold text-[#A3A3A3] group-hover:text-[#111111] transition-colors">
                        0{idx + 1}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#111111] group-hover:text-[#000000]">
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-[#111111]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. HOW IT WORKS (WHITE Background, 5 Step Timeline)
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={howItWorksRef}
          id="how-it-works"
          className="py-18 sm:py-24 bg-[#FFFFFF] text-[#111111] border-b border-[#E5E5E5]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header: HOW IT WORKS & From data to recovery. */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2">
              <span className="text-xs font-bold text-[#666666] tracking-widest uppercase block">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
                From data to recovery.
              </h2>
            </div>

            {/* Desktop Timeline (Horizontal 5-step grid) */}
            <div className="hidden lg:grid grid-cols-5 gap-3 relative">
              {/* Horizontal Connecting Guide Line behind cards */}
              <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-[#E5E5E5] -translate-y-6 pointer-events-none z-0" />

              {[
                { num: '01', title: 'IMPORT', desc: 'Ingest recovery portfolios from bank spreadsheets.' },
                { num: '02', title: 'ORGANIZE', desc: 'Structure cases by Taluka, DPD aging, and priority.' },
                { num: '03', title: 'ASSIGN', desc: 'Delegate accounts directly to local field recovery officers.' },
                { num: '04', title: 'FOLLOW UP', desc: 'Record borrower visits, call logs, and payment commitments.' },
                { num: '05', title: 'RECOVER', desc: 'Close resolved cases and reconcile collected funds.' },
              ].map((step, idx) => {
                const isHighlighted = activeStep === idx;
                return (
                  <div
                    key={step.num}
                    onMouseEnter={() => setActiveStep(idx)}
                    className={`relative z-10 p-5 rounded-xl transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer ${
                      isHighlighted
                        ? 'bg-[#111111] text-white border-2 border-[#FFD600] shadow-md -translate-y-1'
                        : 'bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isHighlighted ? 'text-[#FFD600]' : 'text-[#666666]'
                          }`}
                        >
                          {step.num}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHighlighted ? 'bg-[#FFD600]' : 'bg-[#D6D6D6]'
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-sm font-bold uppercase tracking-wider ${
                          isHighlighted ? 'text-white' : 'text-[#111111]'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          isHighlighted ? 'text-[#D1D1D1]' : 'text-[#666666]'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile / Tablet Vertical Timeline (Clean, no horizontal overflow) */}
            <div className="lg:hidden relative pl-6 sm:pl-8 border-l-2 border-[#E5E5E5] space-y-6 max-w-xl mx-auto">
              {[
                { num: '01', title: 'IMPORT', desc: 'Ingest recovery portfolios from bank spreadsheets.' },
                { num: '02', title: 'ORGANIZE', desc: 'Structure cases by Taluka, DPD aging, and priority.' },
                { num: '03', title: 'ASSIGN', desc: 'Delegate accounts directly to local field recovery officers.' },
                { num: '04', title: 'FOLLOW UP', desc: 'Record borrower visits, call logs, and payment commitments.' },
                { num: '05', title: 'RECOVER', desc: 'Close resolved cases and reconcile collected funds.' },
              ].map((step, idx) => {
                const isHighlighted = activeStep === idx;
                return (
                  <div
                    key={step.num}
                    onClick={() => setActiveStep(idx)}
                    className="relative group cursor-pointer"
                  >
                    {/* Circle Node on Timeline Line */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-colors ${
                        isHighlighted
                          ? 'bg-[#FFD600] border-[#111111]'
                          : 'bg-white border-[#A3A3A3] group-hover:border-[#111111]'
                      }`}
                    />

                    <div
                      className={`p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                        isHighlighted
                          ? 'bg-[#111111] text-white border-2 border-[#FFD600] shadow-sm'
                          : 'bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isHighlighted ? 'text-[#FFD600]' : 'text-[#666666]'
                          }`}
                        >
                          {step.num}
                        </span>
                        <h3
                          className={`text-sm font-bold uppercase tracking-wider ${
                            isHighlighted ? 'text-white' : 'text-[#111111]'
                          }`}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isHighlighted ? 'text-[#D1D1D1]' : 'text-[#666666]'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. WHY US SECTION (BLACK Background, 4 Clean Benefits)
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={whyUsRef}
          id="why-us"
          className="py-18 sm:py-24 bg-[#111111] text-white border-b border-[#262626]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2">
              <span className="text-xs font-bold text-[#FFD600] tracking-widest uppercase block">
                BENEFITS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
                WHY RUDRA?
              </h2>
            </div>

            {/* 4 Simple Points: SIMPLE, ORGANIZED, CONNECTED, EFFICIENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                {
                  id: 'simple',
                  num: '01',
                  title: 'SIMPLE',
                  desc: 'Clean, focused workflows without unnecessary complexity or training.',
                },
                {
                  id: 'organized',
                  num: '02',
                  title: 'ORGANIZED',
                  desc: 'Structured records for cases, visits, vehicles, and payments.',
                },
                {
                  id: 'connected',
                  num: '03',
                  title: 'CONNECTED',
                  desc: 'Real-time coordination between office managers and field staff.',
                },
                {
                  id: 'efficient',
                  num: '04',
                  title: 'EFFICIENT',
                  desc: 'Reduce manual paperwork and speed up recovery collection cycles.',
                },
              ].map((benefit, idx) => (
                <div
                  key={benefit.id}
                  className={`p-6 rounded-xl bg-[#1A1A1A] border border-[#262626] hover:border-[#FFD600]/40 transition-all duration-200 hover:-translate-y-1 space-y-2.5 cursor-default ${
                    visibleSections['why-us'] ? 'opacity-100 translate-y-0' : 'opacity-90'
                  }`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <span className="text-xs font-mono font-bold text-[#FFD600] block">
                    {benefit.num}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed font-normal">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. FINAL CTA (LIGHT GRAY Background, Clean, Centered)
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          aria-label="Call to Action"
          className="py-18 sm:py-24 bg-[#F5F5F5] text-[#111111] border-b border-[#E5E5E5] text-center"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              Ready to get started?
            </h2>

            <p className="text-sm sm:text-base text-[#666666] max-w-md mx-auto leading-relaxed">
              Manage your recovery operations in one simple platform.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
              <button
                onClick={handleGetStarted}
                className="group w-full sm:w-auto min-h-[48px] px-8 bg-[#FFD600] hover:bg-[#FACC15] active:scale-[0.98] text-[#111111] font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 text-[#111111] transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-white hover:bg-[#EAEAEA] text-[#111111] border border-[#CCCCCC] font-semibold text-sm uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <span>LOGIN</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER (BLACK Background, Minimal, Responsive)
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#262626] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* LEFT: R logo + RUDRA SERVICES + RECOVERY & REPO PLATFORM */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            tabIndex={0}
            role="button"
            aria-label="Back to top"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') scrollToSection('home');
            }}
          >
            <RudraLogo size={32} />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white tracking-wider uppercase leading-tight group-hover:text-white transition-colors">
                RUDRA SERVICES
              </span>
              <span className="text-[9px] font-medium text-[#666666] tracking-widest uppercase">
                Recovery & Repo Platform
              </span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs text-[#A3A3A3] font-medium uppercase tracking-wider">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'why-us', label: 'Why Us' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* RIGHT: Back to Top & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-1.5 text-xs text-[#666666] text-center md:text-right font-mono">
            <button
              onClick={() => scrollToSection('home')}
              className="inline-flex items-center gap-1 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer mb-1"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <p>© 2026 Rudra Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
