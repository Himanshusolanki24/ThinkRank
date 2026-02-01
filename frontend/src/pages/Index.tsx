import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Dna,
  Target,
  Brain,
  TrendingUp,
  Zap,
  ChevronRight,
  Sparkles,
  GitBranch,
  CheckCircle,
  Play,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Rocket,
  LineChart,
  Shield,
  Puzzle,
  Compass,
  Layers,
  Code2,
  GraduationCap,
  MessageSquare,
} from "lucide-react";

// Animated gradient orbs for background
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
  </div>
);

// Floating particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-400/30"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
};

// DNA Helix Animation for Hero
const DNAHelix = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <svg viewBox="0 0 200 400" className="w-48 h-96">
        {/* DNA Strand Animation */}
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 30 + i * 30;
          return (
            <g key={i}>
              <motion.circle
                cx="60"
                cy={y}
                r="8"
                className="fill-violet-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: [0, 20, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
              <motion.circle
                cx="140"
                cy={y}
                r="8"
                className="fill-cyan-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: [0, -20, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
              <motion.line
                x1="68"
                y1={y}
                x2="132"
                y2={y}
                className="stroke-white/20"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating skill badges */}
      {['React', 'Python', 'AWS', 'Node.js'].map((skill, i) => (
        <motion.div
          key={skill}
          className="absolute px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm text-white/70"
          style={{
            left: `${20 + i * 20}%`,
            top: `${20 + (i % 2) * 60}%`,
          }}
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {skill}
        </motion.div>
      ))}
    </div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Problem cards data
const problems = [
  {
    icon: Puzzle,
    title: "Scattered Learning",
    description: "Jumping between random tutorials without a clear direction, wasting precious time on skills that don't matter.",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
  },
  {
    icon: Shield,
    title: "Hidden Weaknesses",
    description: "Invisible skill gaps silently holding back your career. You don't know what you don't know.",
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Compass,
    title: "No Clear Path",
    description: "Confusion about what to learn next. Every senior dev seems to have taken a different route.",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
];

// Solution features
const solutions = [
  {
    icon: Dna,
    title: "AI Skill Mapping",
    description: "Visualize your entire technical DNA in a beautiful, interactive genome visualization.",
    gradient: "from-violet-600 to-purple-600",
  },
  {
    icon: Target,
    title: "Precision Detection",
    description: "Our AI pinpoints your exact weaknesses with surgical precision using advanced analysis.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Daily Evolution",
    description: "Personalized micro-tasks designed to strengthen your weak points and accelerate growth.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Prep",
    description: "Practice with AI interviewers tailored to your skill level and target companies.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

// How it works steps
const howItWorks = [
  {
    step: "01",
    title: "Connect Your Profile",
    description: "Link your GitHub, resume, or simply tell us about your skills.",
    icon: GitBranch,
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our neural engine maps your complete technical genome in seconds.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Get Your Tasks",
    description: "Receive personalized daily challenges targeting your weaknesses.",
    icon: BookOpen,
  },
  {
    step: "04",
    title: "Watch You Evolve",
    description: "Track your progress as your skill genome strengthens over time.",
    icon: TrendingUp,
  },
];

// Stats
const stats = [
  { value: 15000, suffix: "+", label: "Skills Mapped" },
  { value: 50000, suffix: "+", label: "Tasks Completed" },
  { value: 98, suffix: "%", label: "User Satisfaction" },
  { value: 24, suffix: "/7", label: "AI Available" },
];

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden" ref={containerRef}>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        <GradientOrbs />
        <FloatingParticles />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-sm font-medium text-violet-300">AI-Powered Skill Evolution</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
              >
                <span className="text-white">Stop Guessing.</span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Start Growing.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Map your skills as a living genome. Identify weaknesses with AI precision.
                Evolve daily through personalized challenges designed for your growth.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/build">
                  <Button
                    className="h-14 px-8 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all duration-300 group"
                  >
                    Decode Your Genome
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button
                    variant="outline"
                    className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 text-white rounded-xl backdrop-blur-sm"
                  >
                    <Play className="mr-2 w-5 h-5 fill-current" />
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>AI-powered</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block"
            >
              <DNAHelix />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-3 bg-violet-400 rounded-full" />
          </div>
        </motion.div>
      </motion.section>

      {/* ============================================
          PROBLEM SECTION
          ============================================ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              The Problem
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Why Developers Get{" "}
              <span className="text-red-400">Stuck</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Most developers face the same invisible barriers that prevent them from reaching their potential.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${problem.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-6`}>
                    <problem.icon className={`w-7 h-7 ${problem.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{problem.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SOLUTION SECTION
          ============================================ */}
      <section className="py-32 relative overflow-hidden">
        <GradientOrbs />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              The Solution
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI Co-Pilot</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Skill Genome uses advanced AI to decode your technical DNA and create a personalized evolution path.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <solution.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Four Steps to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Evolution</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                )}

                <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20 mb-6">
                  <step.icon className="w-10 h-10 text-violet-400" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-violet-900/20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/10 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Decode Your{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Potential?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of developers who are evolving their skills with AI-powered precision. Start your journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/build">
                <Button
                  className="h-14 px-10 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="h-14 px-10 text-lg border-white/20 hover:bg-white/5 text-white rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
