import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
  CheckCircle,
  Users,
  Briefcase,
  Activity,
  Cpu,
  Network,
  TerminalSquare,
  ArrowRight,
  Shield,
  Flame,
} from "lucide-react";

interface Skill {
  name: string;
  color: string;
  textColor: string;
}

interface StoredSkills {
  skills: Skill[];
  repoCount?: number;
  username?: string;
  filename?: string;
}

// ─── Interview Module Configs ────────────────────────────────
const interviewTypes = [
  {
    id: "technical",
    title: "Technical Protocol",
    subtitle: "Algorithm Benchmark",
    description: "Deep dive into data structures, algorithms, and coding challenges with live execution.",
    icon: TerminalSquare,
    duration: "AUTO",
    difficulty: "ADAPTIVE",
    accentColor: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "border-cyan-500/40",
    bgHover: "hover:bg-cyan-500/[0.04]",
    selectedBg: "bg-cyan-500/[0.06]",
    selectedRing: "ring-cyan-500/40",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500",
    textAccent: "text-cyan-400",
    available: true,
    features: ["Live Execution", "Memory Profiling", "Edge Case Analysis"],
  },
  {
    id: "system-design",
    title: "System Design",
    subtitle: "Architecture Simulation",
    description: "High-level distributed systems, scalability patterns, and database design challenges.",
    icon: Network,
    duration: "60 MIN",
    difficulty: "HARD",
    accentColor: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "border-violet-500/40",
    bgHover: "hover:bg-violet-500/[0.04]",
    selectedBg: "bg-violet-500/[0.06]",
    selectedRing: "ring-violet-500/40",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
    textAccent: "text-violet-400",
    available: true,
    features: ["Whiteboard Mode", "Load Balancing", "Schema Design"],
  },
  {
    id: "behavioral",
    title: "Behavioral Analysis",
    subtitle: "Psychometric Evaluation",
    description: "STAR method assessment with AI-driven sentiment analysis for leadership and culture fit.",
    icon: Users,
    duration: "45 MIN",
    difficulty: "MEDIUM",
    accentColor: "#EC4899",
    glowColor: "rgba(236, 72, 153, 0.15)",
    borderColor: "border-pink-500/40",
    bgHover: "hover:bg-pink-500/[0.04]",
    selectedBg: "bg-pink-500/[0.06]",
    selectedRing: "ring-pink-500/40",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    textAccent: "text-pink-400",
    available: true,
    features: ["Sentiment Analysis", "Tone Detection", "Core Values"],
  },
  {
    id: "manager",
    title: "Leadership Core",
    subtitle: "Management Track",
    description: "Strategic thinking, team management, and delivery execution simulations.",
    icon: Briefcase,
    duration: "60 MIN",
    difficulty: "EXPERT",
    accentColor: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "border-amber-500/40",
    bgHover: "hover:bg-amber-500/[0.04]",
    selectedBg: "bg-amber-500/[0.06]",
    selectedRing: "ring-amber-500/40",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    textAccent: "text-amber-400",
    available: true,
    features: ["Conflict Resolution", "Roadmap Planning", "Hiring Simulation"],
  },
];

const stats = [
  { label: "Protocol", value: "v2.5", icon: Cpu },
  { label: "Performance", value: "Top 5%", icon: Activity },
  { label: "Global Rank", value: "#42", icon: Award },
  { label: "Status", value: "Online", icon: Zap },
];

// ─── DNA Helix Icon ──────────────────────────────────────────
const DnaIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <path d="M17 6l-2.5-2.5" />
    <path d="M14 8l-1-1" />
    <path d="M7 18l2.5 2.5" />
    <path d="M3.5 14.5l-1 1" />
    <path d="M20.5 9.5l1 1" />
    <path d="M14 16l1 1" />
    <path d="M8 6l1 1" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────
const Interview = () => {
  const [extractedSkills, setExtractedSkills] = useState<StoredSkills | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const navigate = useNavigate();
  const sounds = useSoundEffects();

  useEffect(() => {
    const storedSkills = localStorage.getItem("extractedSkills");
    if (storedSkills) {
      try {
        setExtractedSkills(JSON.parse(storedSkills));
      } catch (e) {
        console.error("Failed to parse stored skills", e);
      }
    }
  }, []);

  const handleLaunch = (typeId: string) => {
    sounds.playClick();
    setSelectedId(typeId);
    setLaunching(true);
    setTimeout(() => {
      if (typeId === "technical") navigate("/interview/technical");
      else navigate("/interview/technical");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-20">
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/5 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[130px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 relative z-10 pt-10">
        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-medium text-cyan-300 tracking-wide">AI Interview Engine — Online</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-3 font-display">
                <span className="text-white">Mission </span>
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Control
                </span>
              </h1>
              <p className="text-gray-500 text-base max-w-lg leading-relaxed">
                Select a simulation module to begin your assessment. All neural engines are calibrated and ready.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 min-w-[110px] hidden lg:block"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1 font-mono uppercase tracking-wider">
                    <s.icon className="w-3 h-3" />
                    {s.label}
                  </div>
                  <div className="text-base font-bold text-white">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Main Grid ──────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left — Genome Identity */}
          <div className="lg:col-span-4 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.04] blur-3xl rounded-full" />

              <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                <DnaIcon />
                Genome Identity
              </h3>

              {extractedSkills && extractedSkills.skills.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {extractedSkills.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-300 flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skill.color }} />
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/[0.05]">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-mono uppercase tracking-wider">
                      <span>Skill Synthesis</span>
                      <span>{Math.min(extractedSkills.skills.length * 12, 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(extractedSkills.skills.length * 12, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 text-sm">
                  No genome data detected. Build your profile first.
                </div>
              )}
            </motion.div>

            {/* Pro Tip Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.03] p-5"
            >
              <h4 className="text-sm font-semibold text-violet-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pro Tip
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                For the most realistic practice, use Mock Interview from the sidebar. It now supports a human-like Chatterbox interviewer voice with browser fallback.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Session Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Modules", value: "4", color: "text-cyan-400" },
                  { label: "AI Personas", value: "5", color: "text-violet-400" },
                  { label: "Problems", value: "100+", color: "text-emerald-400" },
                  { label: "Integrity", value: "Real-time", color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Simulation Modules */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 gap-4">
              {interviewTypes.map((type, index) => {
                const isSelected = selectedId === type.id;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    onClick={() => handleLaunch(type.id)}
                    className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? `${type.borderColor} ${type.selectedBg} ring-1 ${type.selectedRing}`
                        : `border-white/[0.06] bg-white/[0.015] ${type.bgHover}`
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 40px ${type.glowColor}` : undefined,
                    }}
                  >
                    <div className="p-6 relative z-10">
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${type.iconBg}`}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: type.accentColor }} />
                              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: type.accentColor }} />
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: type.accentColor }}>LAUNCHING</span>
                          </div>
                        ) : (
                          <div className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[10px] uppercase font-mono text-gray-600 tracking-wider">
                            Standby
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-gray-100 transition-colors">
                        {type.title}
                      </h3>
                      <div className={`text-[10px] font-mono mb-3 uppercase tracking-widest ${type.textAccent}`}>
                        {type.subtitle}
                      </div>

                      <p className="text-sm text-gray-500 mb-5 leading-relaxed min-h-[40px]">
                        {type.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1.5 mb-5">
                        {type.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3" style={{ color: `${type.accentColor}80` }} />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                        <div className="flex gap-4 text-[11px] font-mono text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {type.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {type.difficulty}
                          </span>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 text-gray-700 transition-all group-hover:translate-x-1"
                          style={{ color: isSelected ? type.accentColor : undefined }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Launch Bar ──────────────────────── */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-5 flex justify-center pointer-events-none"
            >
              <div className="pointer-events-auto">
                <Button
                  size="lg"
                  onClick={() => handleLaunch(selectedId)}
                  className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-gray-100 shadow-[0_0_50px_rgba(255,255,255,0.2)] border border-white/50 text-sm font-bold tracking-wide transition-all hover:scale-[1.03] active:scale-95"
                >
                  {launching ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-pulse" />
                      Initializing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Initialize Protocol
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Interview;
