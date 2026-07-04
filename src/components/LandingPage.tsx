import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Sparkles,
  UploadCloud,
  Cpu,
  Award,
  TrendingUp,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
  Github,
  Linkedin,
  Users,
  Menu,
  X,
  Briefcase,
  Clock,
  Target,
  LineChart,
  Zap,
  CheckCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  UserCheck
} from "lucide-react";

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

// Helper component for animated counters
function AnimatedCounter({ value, duration = 1.5, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    
    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

// Particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeSection, setActiveSection] = useState("home");

  // Parallax mouse variables
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle scroll detection for glassmorphism navbar transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up standard IntersectionObserver for active section highlighting
  useEffect(() => {
    const sections = ["home", "about", "features", "how-it-works", "tech-stack", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Parallax mouse handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 35;
    const y = (clientY - window.innerHeight / 2) / 35;
    setMousePos({ x, y });
  };

  // Testimonials database
  const testimonials = [
    {
      name: "Marcus Thorne",
      role: "VP of Global Talent Sourcing at FinTech Corp",
      content: "HireSense AI completely transformed our volume screening phase. What used to take our recruiters an entire week now resolves in under an hour with near-perfect alignment accuracy.",
      avatarBg: "bg-blue-600",
      initials: "MT",
      stars: 5
    },
    {
      name: "Sophia Vance",
      role: "Lead Executive Recruiter at CloudScale Systems",
      content: "The semantic candidate matching is brilliant. It detected overlaps in legacy frameworks and cloud paradigms that standard keywords totally missed. Our interview conversion rates skyrocketed.",
      avatarBg: "bg-indigo-600",
      initials: "SV",
      stars: 5
    },
    {
      name: "Devon Ramirez",
      role: "Head of People & Culture at Innovate Labs",
      content: "We're absolutely blown away by the Gemini auto-generated interview questions and cover-letter insights. It makes screening incredibly objective and speeds up our hiring velocity exponentially.",
      avatarBg: "bg-cyan-600",
      initials: "DR",
      stars: 5
    }
  ];

  // Auto-play testimonials carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // How it works sequential workflow data
  const workflowSteps = [
    {
      id: 1,
      title: "Upload Resume",
      desc: "Candidates can easily drag and drop or select PDF/TXT resumes within the candidate portal.",
      icon: UploadCloud,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 2,
      title: "AI Resume Parsing",
      desc: "Our advanced parsing engine extracts technical stacks, work experience timelines, and structured data.",
      icon: Cpu,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 3,
      title: "ATS Score Generation",
      desc: "Calculates an optimized compatibility ratio based on industry parameters and standard models.",
      icon: Award,
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 4,
      title: "Semantic Candidate Matching",
      desc: "Leverages vector matching to identify required skills even when candidates use alternative keywords.",
      icon: Target,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 5,
      title: "Candidate Ranking",
      desc: "Instantly ranks and positions matching talent based on objective competency-to-role analytics.",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 6,
      title: "Recruiter Dashboard",
      desc: "A fully unified administrative control panel featuring interactive charts, filterable results, and real-time AI chatbot assistance.",
      icon: Briefcase,
      color: "from-blue-600 to-cyan-500"
    }
  ];

  // Generated static background particles
  const particles: Particle[] = [
    { id: 1, x: 10, y: 15, size: 4, duration: 6, delay: 0 },
    { id: 2, x: 25, y: 35, size: 6, duration: 8, delay: 1 },
    { id: 3, x: 45, y: 20, size: 3, duration: 5, delay: 2 },
    { id: 4, x: 70, y: 40, size: 5, duration: 7, delay: 0.5 },
    { id: 5, x: 85, y: 15, size: 4, duration: 9, delay: 1.5 },
    { id: 6, x: 90, y: 55, size: 6, duration: 6, delay: 2.5 },
    { id: 7, x: 15, y: 70, size: 3, duration: 7, delay: 3 },
    { id: 8, x: 35, y: 85, size: 5, duration: 8, delay: 0.2 },
    { id: 9, x: 60, y: 75, size: 4, duration: 6, delay: 1.8 },
    { id: 10, x: 80, y: 80, size: 5, duration: 9, delay: 0.8 },
  ];

  // Feature cards definitions - EXACTLY 12 features from the prompt
  const features = [
    {
      title: "AI Resume Parsing",
      desc: "Automated high-fidelity extraction of experiences, qualifications, and core competencies using Google Gemini models.",
      icon: Cpu,
      badge: "Gemini 1.5 Pro"
    },
    {
      title: "ATS Compatibility Score",
      desc: "Real-time parsing and dynamic feedback highlighting match strength against technical requirements.",
      icon: Award,
      badge: "Real-time"
    },
    {
      title: "Semantic Candidate Matching",
      desc: "Advanced cognitive semantic queries comparing candidate credentials with customized job criteria.",
      icon: Target,
      badge: "Semantic"
    },
    {
      title: "Recruiter Dashboard",
      desc: "Interactive recruitment dashboard built to manage jobs, trigger matches, and chat with an intelligent candidate screening bot.",
      icon: Briefcase,
      badge: "Full Admin"
    },
    {
      title: "Candidate Dashboard",
      desc: "Direct access portal for candidates to upload credentials, view ATS metrics, check match matrices, and discover key learning recommendations.",
      icon: Users,
      badge: "Self Service"
    },
    {
      title: "Resume Analytics",
      desc: "Rich charts, time-series progression curves, and dynamic visualizations mapping key competency development over time.",
      icon: LineChart,
      badge: "D3.js Built"
    },
    {
      title: "Google Gemini Integration",
      desc: "Deep integration leveraging state-of-the-art LLM prompts to analyze resumes, write custom cover letters, and auto-draft recruiter invitations.",
      icon: Sparkles,
      badge: "Google Cloud"
    },
    {
      title: "JWT Authentication",
      desc: "Role-based credentials safeguarding user records and system profiles via industry-standard authentication protocols.",
      icon: ShieldCheck,
      badge: "High Security"
    },
    {
      title: "Secure Login",
      desc: "Fully encrypted secure login flow with session persistence and token refresh for seamless security.",
      icon: ShieldCheck,
      badge: "Encrypted"
    },
    {
      title: "Fast Resume Screening",
      desc: "Sub-second database scanning and instant profile lookups to eliminate bulk screening delays.",
      icon: Zap,
      badge: "Ultra Fast"
    },
    {
      title: "Intelligent Candidate Ranking",
      desc: "Algorithmic sorting that instantly lists matching talent based on parsed experience maps.",
      icon: TrendingUp,
      badge: "Smart Sort"
    },
    {
      title: "Modern Recruiter Experience",
      desc: "A clean, modern workspace designed to maximize throughput and allow hiring managers to screen candidates intuitively.",
      icon: Sparkles,
      badge: "Next-Gen UI"
    }
  ];

  // EXACTLY 6 requested benefits in the prompt
  const benefits = [
    {
      title: "Save Recruiter Time",
      desc: "Eliminate hundreds of hours spent manually filtering profiles. Our screening agent identifies top candidates instantly.",
      icon: Clock,
      highlight: "85% faster screening"
    },
    {
      title: "Reduce Manual Screening",
      desc: "Move directly from upload to high-confidence shortlist profiles. Let recruiters focus on final interviews.",
      icon: Briefcase,
      highlight: "Zero backlog stress"
    },
    {
      title: "Improve Hiring Accuracy",
      desc: "Identify skills alignment through smart parsing, bypassing formatting inconsistencies and spelling variances.",
      icon: Target,
      highlight: "Over 94% alignment"
    },
    {
      title: "AI Powered Recruitment",
      desc: "Eliminate systemic biases and base hiring decisions entirely on objective, parsed competency scores.",
      icon: Sparkles,
      highlight: "Objective & structured"
    },
    {
      title: "Better Candidate Experience",
      desc: "Applicants receive instant resume scores and constructive recommendations, creating high-trust relationships.",
      icon: Users,
      highlight: "Transparent reports"
    },
    {
      title: "Faster Decision Making",
      desc: "Accelerate standard recruitment lifecycles with immediate ranking queues and auto-generated interview questions.",
      icon: Zap,
      highlight: "Instant shortlist"
    }
  ];

  // Badges glowing on hover with custom styling
  const techStack = [
    { name: "React", category: "Frontend", color: "hover:shadow-blue-500/20 hover:border-blue-500 border-slate-200 text-blue-600 bg-white" },
    { name: "TypeScript", category: "Language", color: "hover:shadow-sky-500/20 hover:border-sky-500 border-slate-200 text-sky-600 bg-white" },
    { name: "Express", category: "Backend", color: "hover:shadow-slate-500/20 hover:border-slate-800 border-slate-200 text-slate-700 bg-white" },
    { name: "Google Gemini", category: "AI Models", color: "hover:shadow-indigo-500/20 hover:border-indigo-500 border-slate-200 text-indigo-600 bg-white" },
    { name: "MongoDB", category: "Database", color: "hover:shadow-emerald-500/20 hover:border-emerald-500 border-slate-200 text-emerald-600 bg-white" },
    { name: "ChromaDB", category: "Vector Store", color: "hover:shadow-cyan-500/20 hover:border-cyan-500 border-slate-200 text-cyan-600 bg-white" },
    { name: "JWT", category: "Security", color: "hover:shadow-purple-500/20 hover:border-purple-500 border-slate-200 text-purple-600 bg-white" },
    { name: "Docker", category: "Ops", color: "hover:shadow-blue-600/20 hover:border-blue-600 border-slate-200 text-blue-700 bg-white" },
    { name: "REST API", category: "Integration", color: "hover:shadow-teal-500/20 hover:border-teal-500 border-slate-200 text-teal-600 bg-white" },
    { name: "Tailwind CSS", category: "Styling", color: "hover:shadow-cyan-400/20 hover:border-cyan-400 border-slate-200 text-cyan-500 bg-white" }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div 
      className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-blue-500/10 selection:text-blue-600 relative" 
      id="landing-root"
      onMouseMove={handleMouseMove}
    >
      
      {/* Premium Light Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #2563eb 1.5px, transparent 1.5px),
            linear-gradient(to right, #2563eb 0.5px, transparent 0.5px),
            linear-gradient(to bottom, #2563eb 0.5px, transparent 0.5px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
        }}
      />
      
      {/* Animated Floating Gradient Blobs */}
      <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 40, -20, 0], 
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 30, 0], 
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.1, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-[-200px] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 20, -40, 0], 
            y: [0, 30, -20, 0],
            scale: [1, 1.05, 0.95, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[400px] left-[30%] w-[400px] h-[400px] rounded-full bg-indigo-500/8 blur-[110px]" 
        />
      </div>

      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="glowing-particles">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: `${p.y}%` }}
            animate={{ 
              y: [`${p.y}%`, `${p.y - 12}%`, `${p.y}%`],
              opacity: [0.15, 0.45, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-400/15 blur-[1px]"
            style={{
              left: `${p.x}%`,
              width: `${p.size}px`,
              height: `${p.size}px`
            }}
          />
        ))}
      </div>

      {/* Modern SaaS Sticky Glassmorphic Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-md border-b border-slate-200/60 py-3" 
            : "bg-transparent py-5"
        }`} 
        id="landing-header"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight font-display">HireSense</span>
              <span className="text-[10px] text-blue-600 font-extrabold ml-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100/80 rounded-md uppercase tracking-wider font-mono">AI</span>
            </div>
          </div>

          {/* Desktop Navigation with Active Section Scrollspy Highlighting */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {["Home", "About", "Features", "How It Works", "Tech Stack", "Contact"].map((item) => {
              const sectionId = item.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeSection === sectionId;
              return (
                <button 
                  key={item}
                  onClick={() => scrollToSection(sectionId)} 
                  className={`relative py-1 transition-all duration-300 text-xs uppercase tracking-wider ${
                    isActive ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onNavigateToAuth}
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-4 py-2 transition-colors uppercase tracking-wider"
            >
              Sign In
            </button>
            <button 
              onClick={onNavigateToAuth}
              className="relative overflow-hidden group text-xs uppercase tracking-widest font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all flex items-center gap-2 border border-blue-500/40"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ x: ["-100%", "250%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown with scroll spy indicators */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white shadow-xl overflow-hidden"
              id="mobile-nav"
            >
              <div className="px-6 py-4 flex flex-col gap-4 text-xs font-bold text-slate-750 uppercase tracking-wider">
                {["Home", "About", "Features", "How It Works", "Tech Stack", "Contact"].map((item) => {
                  const sectionId = item.toLowerCase().replace(/\s+/g, "-");
                  const isActive = activeSection === sectionId;
                  return (
                    <button 
                      key={item}
                      onClick={() => scrollToSection(sectionId)} 
                      className={`text-left py-2.5 border-b border-slate-100 transition-all ${
                        isActive ? "text-blue-600 font-extrabold pl-2 border-l-2 border-l-blue-600 bg-blue-50/40" : "text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={onNavigateToAuth}
                    className="w-full text-center py-3.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all font-bold text-slate-850"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onNavigateToAuth}
                    className="w-full text-center py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-md shadow-blue-500/15"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-visible max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 z-10" id="home">
        
        {/* Hero Left: Title and Subtitle with Entry Animations */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4.5 py-1.5 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI-Driven Candidate Evaluation Engine</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.06] font-display"
          >
            AI Resume Screening & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
              Candidate Matching
            </span> Agent
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans"
          >
            An AI-powered recruitment platform that automates resume screening, ATS scoring, semantic candidate matching, recruiter analytics, and intelligent hiring using Google Gemini AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={onNavigateToAuth}
              className="relative overflow-hidden group w-full sm:w-auto px-8 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/45 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest border border-blue-500/50 flex items-center justify-center gap-2"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ x: ["-100%", "250%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto px-8 py-4.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200/80 shadow-xs hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          </motion.div>

          {/* Hero Statistics Counters */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-md mx-auto lg:mx-0"
          >
            <div>
              <div className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-display">98%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-display">10x</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Saves Time</div>
            </div>
            <div>
              <div className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-display">&lt;1s</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Response</div>
            </div>
          </motion.div>
        </div>

        {/* Hero Right: Premium Interactive Illustration Mockup with Mouse Parallax Effect */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex-1 w-full max-w-xl lg:max-w-none relative" 
          id="hero-illustration"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          {/* Accent Glow Circle */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/15 to-indigo-500/5 rounded-3xl blur-3xl pointer-events-none" />

          {/* Realistic SaaS Dashboard Container */}
          <div className="relative bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
            
            {/* Window control points */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] font-mono font-semibold text-slate-500 ml-3">gemini-screening-agent.json</span>
              </div>
              <span className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                ENGINE ACTIVE
              </span>
            </div>

            {/* Simulated Live UI Content */}
            <div className="space-y-4">
              
              {/* Profile Card Mock */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      AR
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">Alex Rivera</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Senior Full-Stack Engineer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Match score</span>
                    <span className="text-xl font-black text-blue-400 font-mono tracking-tight">92%</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">React & Next.js</span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">TypeScript</span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">Node/Express</span>
                </div>
              </div>

              {/* Progress/Metric Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">ATS Compatibility</span>
                    <h5 className="text-sm font-extrabold text-slate-100 mt-1">v1.0 Resume parsed</h5>
                  </div>
                  <div className="mt-4 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest font-sans">Verification status</span>
                    <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Approved match
                    </h5>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed mt-1">
                    Demonstrates elite system architectures.
                  </p>
                </div>

              </div>

              {/* Bottom active status bar */}
              <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">AI RECOMMENDATION</p>
                    <p className="text-xs font-bold text-slate-200">Interview questions drafted</p>
                  </div>
                </div>
                <button 
                  onClick={onNavigateToAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-md"
                >
                  Verify
                </button>
              </div>

            </div>
          </div>
        </motion.div>

      </section>

      {/* About Section with Scroll Entrance Anim */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-20 lg:py-28 relative" id="about">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Subheader */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              System Architecture & Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Autonomous Talent Shortlisting
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Unlock cognitive candidate profiling. Skip manual spreadsheets and transition to automated matches governed by modern language modeling standards.
            </p>
          </div>

          {/* Staggered cards viewport enter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl relative space-y-5 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">What The Project Is</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                A unified, dual-dashboard ecosystem linking talent applicants with recruitment departments. Built using secure JWT credentials, persistent candidate profiles, and Google Gemini APIs.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl relative space-y-5 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Why Recruiters Need It</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                HR teams read hundreds of resumes every day. HireSense AI automates initial profiling, computes match accuracy ratios, and allows you to interview candidates with high confidence.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl relative space-y-5 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100/50 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">How AI Reduces Effort</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                Our parsing agents map resumes into structured properties in seconds. Instead of manually reading endless files, get instant shortlist rankings to begin recruiting immediately.
              </p>
            </motion.div>

          </div>

          {/* Deep Feature Highlights */}
          <div className="mt-16 pt-16 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 font-display">ATS Compatibility Mapping</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Avoid formatting penalties or arbitrary parsing errors. Our model scans the layout directly to secure key information points cleanly.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Target className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 font-display">Semantic Candidate Matching</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Go beyond literal keyword matches. Let the semantic vector engine align conceptual competencies, synonyms, and overlapping technical frameworks.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100/60 text-cyan-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 font-display">Faster Sourcing Lifecycles</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Scale candidate outreach instantly. The built-in email draft tools write optimized recruitment scripts and cover letters on behalf of recruiters.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100/60 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 font-display">Equitable Talent Pipelines</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Candidates receive high-fidelity, transparent alignment feedback directly on their dashboards, outlining clear recommendations for career development and skill mastery.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* How It Works Timeline with sequentially staggered viewport enter animations */}
      <section className="bg-white py-20 lg:py-28 overflow-hidden" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              System Pipeline Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Streamlined Candidate Sourcing
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Witness how the agent takes unstructured resumes and converts them into ranked profiles and recruiter dashboard elements.
            </p>
          </div>

          {/* Sequential Timeline Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative" id="workflow-grid">
            
            {workflowSteps.map((step, index) => {
              const IconComp = step.icon;
              return (
                <motion.div 
                  key={step.id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col items-center"
                >
                  
                  {/* Step Card */}
                  <div 
                    onClick={() => setActiveStep(index)}
                    className={`w-full bg-slate-50 border rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 relative group h-full flex flex-col justify-between ${
                      activeStep === index 
                        ? "border-blue-500 ring-4 ring-blue-500/15 shadow-xl scale-102 bg-white" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div>
                      {/* Step index circle indicator */}
                      <span className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-black flex items-center justify-center mb-4 mx-auto">
                        0{step.id}
                      </span>

                      {/* Icon container */}
                      <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-5.5 h-5.5" />
                      </div>

                      <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-2 font-display">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {/* Connecting Arrow for desktop */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 -right-3.5 z-10 text-slate-300 transform translate-x-1/2">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  {/* Connecting indicator for mobile */}
                  {index < workflowSteps.length - 1 && (
                    <div className="lg:hidden my-2 text-slate-400 font-bold">
                      ↓
                    </div>
                  )}

                </motion.div>
              );
            })}

          </div>

          {/* Active workflow information detail container */}
          <motion.div 
            layout
            className="mt-10 bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto border border-slate-800"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <h5 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-400">
                Workflow Step 0{activeStep + 1}: {workflowSteps[activeStep].title}
              </h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {workflowSteps[activeStep].desc}
            </p>
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-20 lg:py-28" id="features">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              Capability Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Advanced Feature Suite
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Explore how we integrate state-of-the-art tooling to secure resume indexes and construct deep, beautiful charts.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
                  whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  className="bg-white border border-slate-200 p-6 rounded-3xl relative flex flex-col justify-between transition-all duration-300 group hover:border-slate-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {/* Icon with smooth rotation on parent card hover */}
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 group-hover:rotate-6 transition-transform">
                        <IconComp className="w-5.5 h-5.5 text-blue-600" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 font-display">{feat.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-sans">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Statistics Section with dynamic animated counters */}
      <section className="bg-slate-900 text-slate-100 py-16 border-y border-slate-850 relative text-center" id="stats">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black font-display text-blue-400 tracking-tight">
                <AnimatedCounter value={1000} suffix="+" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest font-sans">
                Resumes Processed
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black font-display text-cyan-400 tracking-tight">
                <AnimatedCounter value={95} suffix="%" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest font-sans">
                Matching Accuracy
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black font-display text-indigo-400 tracking-tight">
                <AnimatedCounter value={80} suffix="%" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest font-sans">
                Reduction in Screening Time
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black font-display text-emerald-400 tracking-tight">
                <AnimatedCounter value={99} suffix="%" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest font-sans">
                ATS Parsing Success
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section with staggered viewport fade-in animations */}
      <section className="bg-white py-20 lg:py-28" id="benefits">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              Value Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Built For Enterprise Sourcing
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Discover how AI-powered recruitment maps and metrics deliver competitive hiring advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => {
              const IconComp = benefit.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                  className="bg-slate-50 border border-slate-200 p-6 rounded-3xl flex flex-col justify-between transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30">
                      <IconComp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight font-display">{benefit.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-sans">{benefit.desc}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-200/80 text-[10px] font-mono font-bold text-blue-600">
                    {benefit.highlight}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Technology Stack Section featuring glowing badges on hover */}
      <section className="bg-slate-50 border-y border-slate-200 py-20 lg:py-28" id="tech-stack">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              SaaS Engine Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Enterprise Sourcing Stack
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Formulated with state-of-the-art tools ensuring fast rendering, strict security, and cognitive matching capabilities.
            </p>
          </div>

          {/* Interactive Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto" id="tech-badge-container">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.04 }}
                className={`px-4.5 py-3 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2.5 shadow-xs cursor-default ${tech.color}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{tech.name}</span>
                <span className="text-[9px] opacity-60 font-mono tracking-wider font-medium">| {tech.category}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="bg-white py-20 lg:py-28 overflow-hidden" id="testimonials">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
              Client Feedback
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">
              Endorsed by Top Talent Acquisition
            </h2>
          </div>

          {/* Carousel slide transition wrapper */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-6 left-6 text-slate-200">
              <MessageSquare className="w-16 h-16 opacity-30" />
            </div>

            <div className="relative min-h-[160px] flex flex-col justify-between z-10">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-base sm:text-lg leading-relaxed italic font-sans font-medium">
                    "{testimonials[activeTestimonial].content}"
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                    <div className={`w-11 h-11 rounded-full ${testimonials[activeTestimonial].avatarBg} text-white flex items-center justify-center font-extrabold text-xs shadow-sm`}>
                      {testimonials[activeTestimonial].initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-display">
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex justify-end items-center gap-3 mt-8">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-500">
                  0{activeTestimonial + 1} / 0{testimonials.length}
                </span>
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
                  aria-label="Next Testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Call To Action with glow effects */}
      <section className="bg-slate-50 py-20 lg:py-28 border-t border-slate-200 relative overflow-hidden" id="cta">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-6 space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Position HireSense AI as your central, robust resume-screening and candidate-matching solution to build objective pipelines instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToAuth}
              className="relative overflow-hidden group w-full sm:w-auto px-8 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/45 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest border border-blue-500/50 flex items-center justify-center gap-2"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ x: ["-100%", "250%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span>Start Screening</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto px-8 py-4.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white border-t border-slate-200 py-20" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/50">
                Get In Touch
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">
                Connect With Our Team
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Have questions about our custom embeddings, Gemini configuration, or deployment options? Send us an enquiry below and we will reply shortly.
              </p>

              <div className="space-y-4 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="w-4.5 h-4.5 text-blue-600" />
                  <span>joshwavsb@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4.5 h-4.5 text-blue-600" />
                  <span>Enterprise Sourcing Technologies Inc.</span>
                </div>
              </div>
            </div>

            {/* Enquire Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 font-display">Send an Enquiry</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-white border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" 
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full bg-white border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" 
                />
                <textarea 
                  rows={3} 
                  placeholder="Describe your requirements..." 
                  className="w-full bg-white border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" 
                />
                <button 
                  onClick={onNavigateToAuth}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all uppercase tracking-wider"
                >
                  Send Enquiry
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900" id="landing-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo Brand / Copy */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm font-display">HireSense AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              © 2026 HireSense AI. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-400">
            <button onClick={() => scrollToSection("about")} className="hover:text-white transition-colors uppercase tracking-wider text-[10px]">About</button>
            <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors uppercase tracking-wider text-[10px]">Features</button>
            <button onClick={() => scrollToSection("benefits")} className="hover:text-white transition-colors uppercase tracking-wider text-[10px]">Privacy</button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors uppercase tracking-wider text-[10px]">Contact</button>
          </div>

          {/* Social Media Icons with Tooltips & Hover Animations */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <a 
                href="https://github.com/JoshwaBaskar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-md hover:-translate-y-1 hover:scale-105"
                aria-label="GitHub Profile"
              >
                <Github className="w-4.5 h-4.5" />
              </a>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none scale-95 group-hover:scale-100 shadow-xl">
                JoshwaBaskar on GitHub
              </span>
            </div>
            
            <div className="relative group">
              <a 
                href="https://www.linkedin.com/in/joshwa-b-322967291/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-md hover:-translate-y-1 hover:scale-105"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4.5 h-4.5" />
              </a>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none scale-95 group-hover:scale-100 shadow-xl">
                joshwa-b-322967291 on LinkedIn
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
