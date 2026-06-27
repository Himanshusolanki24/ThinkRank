import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { SiAmazonwebservices, SiNodedotjs, SiPython, SiReact, SiTypescript, SiDocker, SiGraphql } from "react-icons/si";
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

const HERO_SKILLS = [
  {
    name: "React",
    Icon: SiReact,
    iconClassName: "text-cyan-400",
    left: "2%",
    top: "12%",
    duration: 3.4,
    rotate: -8,
    glowClassName: "from-cyan-500/25 to-cyan-400/5",
  },
  {
    name: "AWS",
    Icon: SiAmazonwebservices,
    iconClassName: "text-orange-400",
    left: "64%",
    top: "6%",
    duration: 4.1,
    rotate: 7,
    glowClassName: "from-orange-500/25 to-orange-400/5",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    iconClassName: "text-blue-400",
    left: "82%",
    top: "32%",
    duration: 3.6,
    rotate: 6,
    glowClassName: "from-blue-500/25 to-indigo-400/5",
  },
  {
    name: "Python",
    Icon: SiPython,
    iconClassName: "text-[#FFD43B]",
    left: "0%",
    top: "46%",
    duration: 3.8,
    rotate: -6,
    glowClassName: "from-yellow-500/25 to-blue-400/5",
  },
  {
    name: "GraphQL",
    Icon: SiGraphql,
    iconClassName: "text-pink-400",
    left: "38%",
    top: "42%",
    duration: 4.3,
    rotate: -5,
    glowClassName: "from-pink-500/25 to-fuchsia-400/5",
  },
  {
    name: "Docker",
    Icon: SiDocker,
    iconClassName: "text-sky-400",
    left: "74%",
    top: "62%",
    duration: 4.0,
    rotate: 8,
    glowClassName: "from-sky-500/25 to-cyan-400/5",
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    iconClassName: "text-green-400",
    left: "6%",
    top: "80%",
    duration: 4.5,
    rotate: 9,
    glowClassName: "from-green-500/25 to-emerald-400/5",
  },
] as const;

// ── Neon colour helpers for the DNA helix ──
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgbToHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (c1: string, c2: string, t: number) => {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
};
const lerpPalette = (stops: string[], t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const seg = c * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  return mix(stops[i], stops[i + 1], seg - i);
};
const lighten = (c: string, a: number) => mix(c, "#ffffff", a);
const darken = (c: string, a: number) => mix(c, "#000000", a);

// DNA Helix — glossy neon double helix (glassy spheres, bloom, particles)
const DNAHelix = () => {
  const N = 13;
  const CX = 100;
  const AMP = 58;
  const Y_TOP = 30;
  const GAP = 26;
  const ANGLE_STEP = 0.6;
  const SAMPLES = 17;
  const DURATION = 9;

  const PAL_A = ["#3B82F6", "#22D3EE", "#8B5CF6"]; // blue → cyan → violet
  const PAL_B = ["#22D3EE", "#8B5CF6", "#D946EF"]; // cyan → violet → magenta

  const phases = Array.from({ length: SAMPLES }, (_, k) => (2 * Math.PI * k) / (SAMPLES - 1));
  const depth = (a: number) => (Math.cos(a) + 1) / 2; // 0 (back) → 1 (front)

  const rows = Array.from({ length: N }, (_, i) => {
    const angle = i * ANGLE_STEP;
    const t = i / (N - 1);
    return {
      i,
      y: Y_TOP + i * GAP,
      colorA: lerpPalette(PAL_A, t),
      colorB: lerpPalette(PAL_B, t),
      axK: phases.map((p) => CX + AMP * Math.sin(angle + p)),
      bxK: phases.map((p) => CX - AMP * Math.sin(angle + p)),
      aRK: phases.map((p) => 3.2 + 3.8 * depth(angle + p)),
      bRK: phases.map((p) => 3.2 + 3.8 * depth(angle + p + Math.PI)),
      aOpK: phases.map((p) => 0.5 + 0.5 * depth(angle + p)),
      bOpK: phases.map((p) => 0.5 + 0.5 * depth(angle + p + Math.PI)),
      rungOpK: phases.map((p) => 0.1 + 0.42 * Math.abs(Math.sin(angle + p))),
    };
  });

  const loop = { duration: DURATION, repeat: Infinity, ease: "linear" as const };

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${6 + ((i * 37) % 88)}%`,
    top: `${8 + ((i * 53) % 84)}%`,
    size: 1.5 + (i % 3),
    color: ["#3B82F6", "#22D3EE", "#8B5CF6", "#D946EF"][i % 4],
    duration: 3 + (i % 4),
    delay: (i % 5) * 0.4,
  }));

  return (
    <div className="relative w-full h-[540px] flex items-center justify-center">
      {/* Deep glow pools (depth-of-field bloom) */}
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2),transparent_60%)] blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_60%)] blur-2xl" />

      {/* Concentric radar rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-[480px] w-[480px] rounded-full border border-white/[0.05]" />
        <div className="absolute h-[370px] w-[370px] rounded-full border border-white/[0.04]" />
        <div className="absolute h-[260px] w-[260px] rounded-full border border-white/[0.03]" />
        <motion.div
          className="absolute h-[480px] w-[480px] rounded-full border border-violet-400/10"
          style={{ borderTopColor: "rgba(34,211,238,0.35)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[300px] w-[300px] rounded-full border border-dashed border-fuchsia-400/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating particles / glowing dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
            animate={{ opacity: [0.15, 0.85, 0.15], scale: [1, 1.6, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 200 410"
        className="relative z-10 w-[330px] h-[480px]"
        style={{ filter: "drop-shadow(0 0 20px rgba(99,102,241,0.45)) drop-shadow(0 0 12px rgba(34,211,238,0.32))" }}
      >
        <defs>
          {rows.flatMap((r) => {
            const a = { s0: lighten(r.colorA, 0.92), s1: lighten(r.colorA, 0.35), s2: r.colorA, s3: darken(r.colorA, 0.55) };
            const b = { s0: lighten(r.colorB, 0.92), s1: lighten(r.colorB, 0.35), s2: r.colorB, s3: darken(r.colorB, 0.55) };
            return [
              <radialGradient key={`sphA-${r.i}`} id={`sphA-${r.i}`} cx="35%" cy="28%" r="72%">
                <stop offset="0%" stopColor={a.s0} stopOpacity="0.95" />
                <stop offset="26%" stopColor={a.s1} />
                <stop offset="66%" stopColor={a.s2} />
                <stop offset="100%" stopColor={a.s3} />
              </radialGradient>,
              <radialGradient key={`sphB-${r.i}`} id={`sphB-${r.i}`} cx="35%" cy="28%" r="72%">
                <stop offset="0%" stopColor={b.s0} stopOpacity="0.95" />
                <stop offset="26%" stopColor={b.s1} />
                <stop offset="66%" stopColor={b.s2} />
                <stop offset="100%" stopColor={b.s3} />
              </radialGradient>,
            ];
          })}
          <linearGradient id="dnaRung" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>

        {rows.map((r) => (
          <g key={r.i}>
            {/* glowing rod */}
            <motion.line
              x1={r.axK[0]}
              x2={r.bxK[0]}
              y1={r.y}
              y2={r.y}
              stroke="url(#dnaRung)"
              strokeWidth={2.4}
              strokeLinecap="round"
              initial={{ opacity: r.rungOpK[0] }}
              animate={{ x1: r.axK, x2: r.bxK, opacity: r.rungOpK }}
              transition={loop}
            />
            {/* glassy sphere — strand A */}
            <motion.circle
              cy={r.y}
              fill={`url(#sphA-${r.i})`}
              stroke={lighten(r.colorA, 0.45)}
              strokeWidth={0.4}
              strokeOpacity={0.45}
              initial={{ cx: r.axK[0], r: r.aRK[0], opacity: r.aOpK[0] }}
              animate={{ cx: r.axK, r: r.aRK, opacity: r.aOpK }}
              transition={loop}
            />
            {/* glassy sphere — strand B */}
            <motion.circle
              cy={r.y}
              fill={`url(#sphB-${r.i})`}
              stroke={lighten(r.colorB, 0.45)}
              strokeWidth={0.4}
              strokeOpacity={0.45}
              initial={{ cx: r.bxK[0], r: r.bRK[0], opacity: r.bOpK[0] }}
              animate={{ cx: r.bxK, r: r.bRK, opacity: r.bOpK }}
              transition={loop}
            />
          </g>
        ))}
      </svg>

      {/* Floating skill badges */}
      {HERO_SKILLS.map((skill, i) => (
        <motion.div
          key={skill.name}
          className={`absolute z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br ${skill.glowClassName} px-3 py-2.5 text-sm text-white shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl`}
          style={{
            left: skill.left,
            top: skill.top,
            rotate: `${skill.rotate}deg`,
          }}
          animate={{
            y: [-12, 10, -12],
            x: [0, i % 2 === 0 ? 8 : -8, 0],
            rotate: [`${skill.rotate - 2}deg`, `${skill.rotate + 2}deg`, `${skill.rotate - 2}deg`],
          }}
          transition={{ duration: skill.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/35 ring-1 ring-white/10">
            <skill.Icon className={`h-5 w-5 ${skill.iconClassName}`} />
          </div>
          <div className="pr-1">
            <span className="block text-[15px] font-semibold tracking-wide">{skill.name}</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-white/45">Skill</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Lazily-loaded interactive three.js DNA helix element (keeps three.js off the main bundle)
const DNAHelixHero = lazy(() => import("@/components/DNAHelixHero"));

// Hero DNA visual — interactive 3D genome panel
const HeroDNAVisual = () => {
  return (
    <div className="relative w-full h-[900px] -mt-32 flex items-center justify-center">
      {/* Soft outer bloom into the page */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(138,92,255,0.28),transparent_62%)] blur-3xl" />

      {/* Interactive genome — transparent canvas, blends straight into the page */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<DNAHelix />}>
          <DNAHelixHero />
        </Suspense>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/35">
          Drag to rotate
        </div>
      </div>

      {/* Skill badges orbiting the helix */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
      >
        {HERO_SKILLS.map((skill, i) => {
          const angle = (i * 360) / HERO_SKILLS.length;
          return (
            <div
              key={skill.name}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angle}deg) translateY(-340px)` }}
            >
              {/* counter-rotate so the badge stays upright while the ring spins */}
              <motion.div
                className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br ${skill.glowClassName} px-3 py-2.5 text-sm text-white shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl`}
                style={{ x: "-50%", y: "-50%" }}
                initial={{ rotate: -angle }}
                animate={{ rotate: -angle - 360 }}
                transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/35 ring-1 ring-white/10">
                  <skill.Icon className={`h-5 w-5 ${skill.iconClassName}`} />
                </div>
                <div className="pr-1">
                  <span className="block text-[15px] font-semibold tracking-wide">{skill.name}</span>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-white/45">Skill</span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
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

const thinkRankFlow = [
  {
    title: "Structured\nRoadmap",
    subtitle: "Personalized Path",
    description: "Build a plan from your time, level, and target role.",
    icon: Brain,
    tone: "violet",
    positionClassName: "left-[8%] top-[20%]",
  },
  {
    title: "Focused\nPractice",
    subtitle: "Daily Tasks",
    description: "Turn weak areas into targeted coding sessions.",
    icon: Zap,
    tone: "cyan",
    positionClassName: "left-[42%] top-[16%]",
  },
  {
    title: "Expert\nFeedback",
    subtitle: "AI Review",
    description: "Practice with company-style interviewers and code review.",
    icon: MessageSquare,
    tone: "emerald",
    positionClassName: "left-[40%] top-[54%]",
  },
  {
    title: "Dream\nOffer",
    subtitle: "Placement Targeting",
    description: "Convert consistency into real company readiness.",
    icon: Target,
    tone: "amber",
    positionClassName: "left-[75%] top-[54%]",
  },
] as const;

const toneClasses: Record<string, { border: string; glow: string; iconBg: string; iconColor: string; dot: string }> = {
  violet: {
    border: "border-violet-500/30",
    glow: "from-violet-500/20 to-fuchsia-500/5",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-300",
    dot: "bg-violet-400",
  },
  cyan: {
    border: "border-cyan-500/30",
    glow: "from-cyan-500/20 to-sky-500/5",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-300",
    dot: "bg-cyan-400",
  },
  amber: {
    border: "border-amber-500/30",
    glow: "from-amber-500/20 to-orange-500/5",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
    dot: "bg-amber-400",
  },
  emerald: {
    border: "border-emerald-500/30",
    glow: "from-emerald-500/20 to-teal-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-300",
    dot: "bg-emerald-400",
  },
};

const ThinkRankCapabilityAnimation = () => {
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const activeFlowItem = thinkRankFlow[activeFlowIndex];
  const backgroundCells = Array.from({ length: 30 }, (_, i) => i);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFlowIndex((current) => (current + 1) % thinkRankFlow.length);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#09090D] px-5 py-8 sm:px-8 sm:py-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute -top-28 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_1.15fr] lg:items-center">
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300"
          >
            <Rocket className="h-4 w-4" />
            What ThinkRank Can Do
          </motion.span>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold leading-tight text-white sm:text-4xl font-display tracking-tight"
          >
            From raw skills to{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              interview-ready momentum
            </span>
            .
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-lg leading-relaxed text-gray-400"
          >
            ThinkRank turns your resume, GitHub, and practice history into a living system: skill genome, smart roadmap, daily tasks, AI interviews, and placement targeting.
          </motion.p>

          <div className="mt-8 space-y-3">
            {[
              "Pinpoints real weaknesses instead of generic advice",
              "Builds a roadmap around your time and target company",
              "Connects practice directly to interview outcomes",
            ].map((point, idx) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.12 + idx * 0.08 }}
                className="flex items-center gap-3 text-sm text-gray-300"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </span>
                <span>{point}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),transparent_55%)]" />
              <div className="grid grid-cols-6 gap-3 px-4 py-8">
                {backgroundCells.map((cell) => (
                  <motion.div
                    key={cell}
                    className="h-[84px] rounded-[18px] border border-dashed border-white/[0.06] bg-white/[0.01]"
                    animate={{ opacity: [0.24, 0.36, 0.24] }}
                    transition={{ duration: 2.8 + (cell % 5) * 0.2, repeat: Infinity, delay: cell * 0.03 }}
                  />
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/[0.04]" />
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute left-[28%] top-[33%] h-[2px] w-[16%] border-t border-dashed border-cyan-400/70"
                animate={{ opacity: activeFlowIndex >= 1 ? [0.25, 1, 0.5] : 0.18 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute left-[52%] top-[33%] h-[2px] w-[10%] bg-gradient-to-r from-violet-400 to-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
                animate={{ x: activeFlowIndex === 1 ? ["-100%", "100%"] : "-100%", opacity: activeFlowIndex === 1 ? [0, 1, 0] : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute left-[52%] top-[41%] h-[18%] w-[2px] border-l border-dashed border-violet-400/70"
                animate={{ opacity: activeFlowIndex >= 2 ? [0.25, 1, 0.5] : 0.18 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute left-[52%] top-[47%] h-[10%] w-[2px] bg-gradient-to-b from-cyan-300 to-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.45)]"
                animate={{ y: activeFlowIndex === 2 ? ["-90%", "120%"] : "-90%", opacity: activeFlowIndex === 2 ? [0, 1, 0] : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute left-[60%] top-[69%] h-[2px] w-[14%] border-t border-dashed border-amber-400/70"
                animate={{ opacity: activeFlowIndex >= 3 ? [0.25, 1, 0.5] : 0.18 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute left-[64%] top-[69%] h-[2px] w-[10%] bg-gradient-to-r from-emerald-300 to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)]"
                animate={{ x: activeFlowIndex === 3 ? ["-100%", "100%"] : "-100%", opacity: activeFlowIndex === 3 ? [0, 1, 0] : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>

            <div className="relative h-[520px]">
              {thinkRankFlow.map((item, index) => {
                const tone = toneClasses[item.tone];
                const isActive = index === activeFlowIndex;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className={`group absolute h-[150px] w-[170px] overflow-hidden rounded-[22px] border bg-gradient-to-br ${tone.glow} ${tone.border} ${item.positionClassName}`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_45%)]"
                      animate={{ opacity: isActive ? 1 : 0.5 }}
                      transition={{ duration: 0.4 }}
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: isActive ? ["0%", "420%"] : "0%", opacity: isActive ? [0, 0.8, 0] : 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    <motion.div
                      animate={{
                        scale: isActive ? 1.06 : 0.96,
                        opacity: isActive ? 1 : 0.78,
                        y: isActive ? [0, -8, 0] : [0, index % 2 === 0 ? -3 : 3, 0],
                        boxShadow: [
                          "0 0 0 rgba(0,0,0,0)",
                          isActive ? "0 22px 55px rgba(0,0,0,0.38)" : "0 10px 24px rgba(0,0,0,0.16)",
                          "0 0 0 rgba(0,0,0,0)",
                        ],
                      }}
                      transition={{
                        scale: { duration: 0.45, ease: "easeOut" },
                        opacity: { duration: 0.45, ease: "easeOut" },
                        y: { duration: isActive ? 1.2 : 3.8 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
                        boxShadow: { duration: isActive ? 1.2 : 3.8 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className="relative flex h-full flex-col justify-between p-4"
                    >
                      <div className="flex items-start justify-between">
                        <motion.div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.iconBg} ring-1 ring-white/10`}
                          animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                        >
                          <item.icon className={`h-5 w-5 ${tone.iconColor}`} />
                        </motion.div>
                        <motion.span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`}
                          animate={isActive ? { opacity: [0.5, 1, 0.5], scale: [1, 1.35, 1] } : { opacity: [0.2, 0.45, 0.2], scale: [1, 1.05, 1] }}
                          transition={{ duration: isActive ? 0.9 : 2.2, repeat: Infinity, delay: index * 0.15 }}
                        />
                      </div>

                      <div>
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                          {item.subtitle}
                        </div>
                        <h4 className={`whitespace-pre-line text-[18px] font-semibold leading-tight ${isActive ? "text-white" : "text-white/80"}`}>{item.title}</h4>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-[#05050A] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden" ref={containerRef}>
      {/* Atmosphere — dark purple gradient + subtle blue/violet nebula behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#1A103D_0%,#120B2F_28%,#0A0718_58%,#05050A_100%)]" />
        <div className="absolute -top-32 left-1/4 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#3F7DFF]/[0.12] blur-[170px]" />
        <div className="absolute top-1/4 right-0 h-[560px] w-[560px] translate-x-1/3 rounded-full bg-[#8A5CFF]/[0.12] blur-[170px]" />
        <div className="absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full bg-[#38E8FF]/[0.06] blur-[180px]" />
      </div>
      <div className="relative z-10">

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
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
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight font-display"
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
                    className="h-14 px-8 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all duration-300 group"
                  >
                    Decode Your Genome
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button
                    variant="outline"
                    className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 text-white rounded-2xl backdrop-blur-sm"
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
              <HeroDNAVisual />
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
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
                  <h3 className="text-xl font-semibold text-white font-display tracking-tight mb-3">{problem.title}</h3>
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
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
                  <h3 className="text-xl font-semibold text-white font-display tracking-tight mb-3">{solution.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THINKRANK FLOW SECTION
          ============================================ */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              ThinkRank In Action
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
              One system for{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                roadmap, practice, and placement
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Instead of scattered tools, ThinkRank connects skill discovery, learning plans, interviews, and company readiness into one animated workflow.
            </p>
          </motion.div>

          <ThinkRankCapabilityAnimation />
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
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
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
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
                  className="h-14 px-10 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="h-14 px-10 text-lg border-white/20 hover:bg-white/5 text-white rounded-2xl"
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
    </div>
  );
};

export default Index;
