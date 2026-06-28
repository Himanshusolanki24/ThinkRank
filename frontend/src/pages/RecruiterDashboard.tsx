import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
<<<<<<< HEAD
  Plus,
  Bookmark,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  Eye,
  Brain,
  GitBranch,
  Zap,
=======
  Search,
  ChevronDown,
  X,
  User,
  Clock,
  CheckCircle2,
  XCircle,
>>>>>>> main
} from "lucide-react";

/**
 * PRODUCTION-READY RECRUITER DASHBOARD
 * 
 * Assumptions & Notes:
 * - Mock data is generated synchronously here, but in production would come from an API query.
 * - Slicing (pagination) is used to prevent rendering hundreds of nodes, limiting to 30 at a time.
 * - Colors for status (hire=green, maybe=amber, reject=red) are defined in a single source of truth (`STATUS_COLORS`).
 */

// ─── Types & Data Model ────────────────────────────────────────────────────────
interface Candidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  tag: string;           
  evaluatedAgo: string;  
  status: "hire" | "maybe" | "reject";
  scores: {
    thinkRank: number;   
    readiness: number;   
    credibility: number; 
    trust: number;       
  };
  skills: string[];
}

interface DashboardStats {
  totalEvaluated: number;
  avgThinkRank: number;     
  trustAlerts: number;      
  conversionRate: number;   
  pipeline: {
    hire: number;
    maybe: number;
    reject: number;
  };
}

// ─── Theme Config & Helpers ───────────────────────────────────────────────────
const STATUS_COLORS = {
  hire: { text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500", lightBg: "bg-emerald-500/10" },
  maybe: { text: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500", lightBg: "bg-amber-500/10" },
  reject: { text: "text-red-500", bg: "bg-red-500", border: "border-red-500", lightBg: "bg-red-500/10" },
};

function getScoreTint(score: number, isTrustMetric = false) {
  // Trust metric is inverse: lower is better (green), higher is worse (red).
  // Standard metrics: higher is better (green).
  if (isTrustMetric) {
    if (score < 30) return "text-emerald-400";
    if (score < 70) return "text-amber-400";
    return "text-red-400";
  }
  
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Mock Data Generation ─────────────────────────────────────────────────────
const MOCK_CANDIDATES: Candidate[] = [
  {
<<<<<<< HEAD
    id: "cand_1",
    name: "Alice Vance",
    role: "Full-Stack Engineer",
    avatar: "AV",
    skills: ["React", "Node.js", "TypeScript", "Docker"],
    archetype: "Full Stack Generalist",
    scores: { thinkRank: 92, readiness: 92, credibility: 95, trustIndex: 98 },
    decision: "HIRE",
    appliedAt: "2 hours ago",
  },
  {
    id: "cand_2",
    name: "Bob Chen",
    role: "Backend Engineer",
    avatar: "BC",
    skills: ["Python", "Django", "PostgreSQL", "Redis"],
    archetype: "Backend Wizard",
    scores: { thinkRank: 89, readiness: 85, credibility: 90, trustIndex: 92 },
    decision: "HIRE",
    appliedAt: "5 hours ago",
  },
  {
    id: "cand_3",
    name: "Chloe Smith",
    role: "Frontend Engineer",
    avatar: "CS",
    skills: ["React", "Tailwind", "JavaScript", "Figma"],
    archetype: "Frontend Specialist",
    scores: { thinkRank: 85, readiness: 76, credibility: 72, trustIndex: 95 },
    decision: "MAYBE",
    appliedAt: "1 day ago",
=======
    id: "c_1", name: "Alice Vance", initials: "AV", avatarColor: "from-violet-600 to-purple-600",
    role: "Senior Full-Stack Engineer", tag: "Full Stack Generalist", evaluatedAgo: "2 hours ago", status: "hire",
    scores: { thinkRank: 94, readiness: 92, credibility: 95, trust: 12 },
    skills: ["TypeScript", "React", "Node.js", "Docker", "AWS", "GraphQL"]
  },
  {
    id: "c_2", name: "Bob Chen", initials: "BC", avatarColor: "from-cyan-600 to-blue-600",
    role: "Backend Engineer", tag: "Backend Wizard", evaluatedAgo: "5 hours ago", status: "hire",
    scores: { thinkRank: 88, readiness: 85, credibility: 90, trust: 15 },
    skills: ["Go", "Kubernetes", "Kafka", "PostgreSQL"]
  },
  {
    id: "c_3", name: "Chloe Smith", initials: "CS", avatarColor: "from-emerald-600 to-teal-600",
    role: "Frontend Engineer", tag: "UI Specialist", evaluatedAgo: "1 day ago", status: "maybe",
    scores: { thinkRank: 78, readiness: 76, credibility: 72, trust: 45 },
    skills: ["React", "CSS", "Tailwind", "Figma", "Storybook"]
>>>>>>> main
  },
  {
    id: "c_4", name: "David Park", initials: "DP", avatarColor: "from-rose-600 to-pink-600",
    role: "ML Engineer", tag: "AI Researcher", evaluatedAgo: "3 hours ago", status: "hire",
    scores: { thinkRank: 91, readiness: 88, credibility: 93, trust: 5 },
    skills: ["Python", "PyTorch", "TensorFlow", "CUDA"]
  },
  {
    id: "c_5", name: "Elena Torres", initials: "ET", avatarColor: "from-amber-600 to-orange-600",
    role: "DevOps Engineer", tag: "Infrastructure", evaluatedAgo: "8 hours ago", status: "maybe",
    scores: { thinkRank: 85, readiness: 82, credibility: 88, trust: 22 },
    skills: ["AWS", "Terraform", "CI/CD", "Docker"]
  },
  {
    id: "c_6", name: "Frank Lee", initials: "FL", avatarColor: "from-indigo-600 to-violet-600",
    role: "Junior Developer", tag: "Entry Level", evaluatedAgo: "2 days ago", status: "reject",
    scores: { thinkRank: 52, readiness: 48, credibility: 55, trust: 85 },
    skills: ["JavaScript", "HTML", "CSS", "Node.js"]
  },
  {
    id: "c_7", name: "Grace Kim", initials: "GK", avatarColor: "from-cyan-600 to-blue-600",
    role: "Data Engineer", tag: "Data pipelines", evaluatedAgo: "12 hours ago", status: "maybe",
    scores: { thinkRank: 82, readiness: 79, credibility: 84, trust: 30 },
    skills: ["Spark", "Airflow", "Python", "SQL"]
  },
  {
    id: "c_8", name: "Henry Wu", initials: "HW", avatarColor: "from-violet-600 to-purple-600",
    role: "Security Engineer", tag: "AppSec", evaluatedAgo: "6 hours ago", status: "hire",
    scores: { thinkRank: 89, readiness: 86, credibility: 91, trust: 10 },
    skills: ["Pen Testing", "OWASP", "Go", "Python", "Burp Suite"]
  },
];

const MOCK_STATS: DashboardStats = {
  totalEvaluated: 48,
  avgThinkRank: 82,
<<<<<<< HEAD
  trustAlerts: 2,
  conversionRate: "24%",
  conversionValue: 24,
  hireCount: 12,
  maybeCount: 18,
  rejectCount: 18,
=======
  trustAlerts: 3, // Inverse metric (high is bad)
  conversionRate: 25,
  pipeline: {
    hire: 12,
    maybe: 18,
    reject: 18,
  },
>>>>>>> main
};

type SortOption = "thinkRank" | "recent" | "name";

// ─── Sub-Components ───────────────────────────────────────────────────────────

const StatsRow: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const statCards = [
    { label: "Total Evaluated", value: stats.totalEvaluated, icon: Users, isAlert: false },
    { label: "Avg ThinkRank", value: stats.avgThinkRank, suffix: "/100", icon: TrendingUp, isAlert: false },
    // Trust Alerts is an inverse metric. Distinct visual treatment (amber icon)
    { label: "Trust Alerts", value: stats.trustAlerts, icon: AlertTriangle, isAlert: true },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: Target, isAlert: false },
  ];

<<<<<<< HEAD
function scoreRing(score: number) {
  if (score >= 85) return "ring-emerald-500/40";
  if (score >= 70) return "ring-amber-500/40";
  return "ring-red-500/40";
}

function scoreBadge(score: number) {
  if (score >= 85) return "text-emerald-300 bg-emerald-500/10";
  if (score >= 70) return "text-amber-300 bg-amber-500/10";
  return "text-red-300 bg-red-500/10";
}

function archetypeIcon(archetype: string) {
  if (archetype.includes("Backend")) return <Code2 className="w-3.5 h-3.5" />;
  if (archetype.includes("Frontend")) return <Eye className="w-3.5 h-3.5" />;
  if (archetype.includes("AI")) return <Brain className="w-3.5 h-3.5" />;
  if (archetype.includes("DevOps")) return <GitBranch className="w-3.5 h-3.5" />;
  return <Zap className="w-3.5 h-3.5" />;
}

// ─── Mini Charts ──────────────────────────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const w = 96;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ProgressRing = ({ value, color }: { value: number; color: string }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={52} height={52} viewBox="0 0 52 52">
      <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <motion.circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform="rotate(-90 26 26)"
      />
    </svg>
  );
};

const RadarMini = ({ color }: { color: string }) => (
  <svg width={52} height={52} viewBox="0 0 52 52">
    {[20, 13, 6].map((r) => (
      <circle key={r} cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
    ))}
    <motion.circle
      cx={38}
      cy={20}
      r={3}
      fill={color}
      initial={{ scale: 0.6, opacity: 0.4 }}
      animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

// ─── Animated Background (shared theme) ───────────────────────────────────────
const RecruiterBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 animate-gradient-mesh opacity-60"
      style={{
        background:
          "radial-gradient(ellipse at 18% 12%, rgba(139, 92, 246, 0.10) 0%, transparent 45%), " +
          "radial-gradient(ellipse at 85% 25%, rgba(0, 229, 255, 0.04) 0%, transparent 50%)",
      }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full blur-[170px]"
      style={{ background: "rgba(139, 92, 246, 0.05)", top: "-15%", left: "-5%" }}
      animate={{ x: [0, 30, -20, 0], y: [0, 25, -15, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// ─── Stat Cards Config ────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    label: "Evaluated",
    value: PIPELINE_STATS.totalEvaluated,
    icon: Users,
    iconBg: "bg-violet-500/15 text-violet-300",
    chart: <Sparkline data={[20, 28, 24, 32, 30, 40, 38, 48]} color="#a78bfa" />,
  },
  {
    label: "Avg. Score",
    value: PIPELINE_STATS.avgThinkRank,
    suffix: "/100",
    icon: TrendingUp,
    iconBg: "bg-blue-500/15 text-blue-300",
    chart: <Sparkline data={[58, 64, 60, 70, 66, 76, 72, 82]} color="#60a5fa" />,
  },
  {
    label: "Alerts",
    value: PIPELINE_STATS.trustAlerts,
    icon: AlertTriangle,
    iconBg: "bg-amber-500/15 text-amber-300",
    chart: <RadarMini color="#fbbf24" />,
  },
  {
    label: "Conversion",
    value: PIPELINE_STATS.conversionRate,
    icon: Target,
    iconBg: "bg-emerald-500/15 text-emerald-300",
    chart: <ProgressRing value={PIPELINE_STATS.conversionValue} color="#34d399" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
=======
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, i) => (
        <div key={i} className="flex flex-col p-4 rounded-xl border border-white/10 bg-white/5">
          {/* Icons sit in a fixed-size badge inside normal flow, not absolutely positioned */}
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              stat.isAlert ? "bg-amber-500/20 text-amber-500" : "bg-violet-500/20 text-violet-400"
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-gray-500 ml-1">{stat.suffix}</span>}
            </p>
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const PipelineBar: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const { totalEvaluated, pipeline } = stats;

  // MATHEMATICALLY PROPORTIONAL PIPELINE BAR
  // Calculate exact percentages. Fallback to 0 if total is 0 to avoid NaN.
  const hirePct = totalEvaluated > 0 ? (pipeline.hire / totalEvaluated) * 100 : 0;
  const maybePct = totalEvaluated > 0 ? (pipeline.maybe / totalEvaluated) * 100 : 0;
  const rejectPct = totalEvaluated > 0 ? (pipeline.reject / totalEvaluated) * 100 : 0;

  // Assertion: ensure widths sum to approximately 100% (allowing minor float precision variance)
  if (totalEvaluated > 0) {
    const sum = hirePct + maybePct + rejectPct;
    console.assert(Math.abs(sum - 100) < 0.1, `Pipeline segments do not sum to 100%, got ${sum}%`);
  }

  return (
    <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider shrink-0 w-20">
        Pipeline
      </span>
      <div className="flex-1 flex items-center h-2.5 rounded-full overflow-hidden bg-white/5 gap-[2px]">
        {hirePct > 0 && (
          <div className={`${STATUS_COLORS.hire.bg} h-full transition-all duration-500`} style={{ width: `${hirePct}%` }} />
        )}
        {maybePct > 0 && (
          <div className={`${STATUS_COLORS.maybe.bg} h-full transition-all duration-500`} style={{ width: `${maybePct}%` }} />
        )}
        {rejectPct > 0 && (
          <div className={`${STATUS_COLORS.reject.bg} h-full transition-all duration-500`} style={{ width: `${rejectPct}%` }} />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-gray-400 shrink-0">
        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.hire.bg}`} /> {pipeline.hire} Hire</span>
        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.maybe.bg}`} /> {pipeline.maybe} Maybe</span>
        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.reject.bg}`} /> {pipeline.reject} Reject</span>
      </div>
    </div>
  );
};

const CandidateCardComponent: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/50"
    >
      {/* Top Border Accent mapped to exact status color */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${STATUS_COLORS[candidate.status].bg}`} />

      {/* Header Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${candidate.avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
            {candidate.initials}
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">
              {candidate.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-400">{candidate.role}</span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{candidate.tag}</span>
            </div>
          </div>
        </div>
        
        {/* Status Pill */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide
          ${STATUS_COLORS[candidate.status].text} ${STATUS_COLORS[candidate.status].border} ${STATUS_COLORS[candidate.status].lightBg}`}
        >
          {candidate.status === 'hire' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
           candidate.status === 'maybe' ? <Clock className="w-3.5 h-3.5" /> : 
           <XCircle className="w-3.5 h-3.5" />}
          {candidate.status}
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "ThinkRank", value: candidate.scores.thinkRank, isTrust: false },
          { label: "Readiness", value: candidate.scores.readiness, isTrust: false },
          { label: "Credibility", value: candidate.scores.credibility, isTrust: false },
          { label: "Trust Index", value: candidate.scores.trust, isTrust: true }, // Trust is inverse
        ].map((score, i) => (
          <div key={i} className="flex flex-col p-2 rounded-lg bg-black/20 border border-white/5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">{score.label}</span>
            <span className={`text-lg font-bold leading-none ${getScoreTint(score.value, score.isTrust)}`}>
              {score.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: Skills & Time */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-wrap gap-1.5 overflow-hidden h-[24px]">
          {/* Skill Tags: truncate gracefully */}
          {candidate.skills.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 text-[11px] font-medium text-gray-300 bg-white/10 rounded border border-white/5 whitespace-nowrap">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-0.5 text-[11px] font-medium text-gray-500 bg-white/5 rounded border border-white/5 whitespace-nowrap">
              +{candidate.skills.length - 3} more
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-gray-500 shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {candidate.evaluatedAgo}
        </span>
      </div>
    </motion.div>
  );
};


// ─── Main Page Component ──────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [stats] = useState<DashboardStats>(MOCK_STATS);
>>>>>>> main
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<"all" | "hire" | "maybe" | "reject">("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 150); // Debounce 150ms
  const [sortOption, setSortOption] = useState<SortOption>("thinkRank");

  // Simulate network fetch
  useEffect(() => {
<<<<<<< HEAD
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const topCandidates = [...MOCK_CANDIDATES]
    .sort((a, b) => b.scores.thinkRank - a.scores.thinkRank)
    .slice(0, 3);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-[#08080d] text-white overflow-y-auto">
      <RecruiterBackground />

      <div className="relative z-10 px-5 md:px-8 py-7 max-w-[1400px] mx-auto">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-sm text-gray-400 mb-1">Good morning, User 👋</p>
            <h1 className="text-3xl md:text-[2.6rem] leading-tight font-bold tracking-tight">
              Build your team with the{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                right talent.
              </span>
            </h1>
          </div>
          <button className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-500/40 bg-violet-500/10 text-sm font-medium text-violet-200 hover:bg-violet-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </motion.div>

        {/* ─── Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.12]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold text-white tracking-tight leading-none">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-sm font-normal text-gray-500"> {stat.suffix}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">{stat.label}</p>
                </div>
                <div className="ml-auto shrink-0">{stat.chart}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Hiring Pipeline ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-6 mb-7"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Hiring Pipeline</h2>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-xs text-gray-300 hover:bg-white/[0.05] transition-colors">
              This Month
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-5">
            {[
              { count: PIPELINE_STATS.hireCount, grad: "from-emerald-500 to-emerald-400" },
              { count: PIPELINE_STATS.maybeCount, grad: "from-amber-500 to-amber-400" },
              { count: PIPELINE_STATS.rejectCount, grad: "from-red-500 to-red-400" },
            ].map((seg, i) => (
              <motion.div
                key={i}
                style={{ flexGrow: seg.count }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + i * 0.12 }}
                className={`origin-left h-2.5 rounded-full bg-gradient-to-r ${seg.grad}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-10">
            {[
              { label: "Hired", count: PIPELINE_STATS.hireCount, dot: "bg-emerald-400" },
              { label: "In Review", count: PIPELINE_STATS.maybeCount, dot: "bg-amber-400" },
              { label: "Rejected", count: PIPELINE_STATS.rejectCount, dot: "bg-red-400" },
            ].map((l) => (
              <div key={l.label}>
                <p className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                  {l.count}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 ml-4">{l.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Top Candidates ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Top Candidates</h2>
          <button className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
            {topCandidates.map((candidate, i) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedCandidate(candidate)}
                className="group rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-4 transition-all duration-300 hover:border-violet-500/30 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${scoreGradient(
                      candidate.scores.thinkRank
                    )} flex items-center justify-center text-sm font-bold text-white ring-2 ${scoreRing(
                      candidate.scores.thinkRank
                    )} ring-offset-2 ring-offset-[#0c0c14] shrink-0`}
                  >
                    {candidate.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-200 transition-colors">
                        {candidate.name}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${scoreBadge(
                          candidate.scores.thinkRank
                        )}`}
                      >
                        {candidate.scores.thinkRank}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2.5">{candidate.role}</p>

                    <div className="flex items-center gap-1.5">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-gray-400">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(candidate.id);
                        }}
                        className="ml-auto text-gray-500 hover:text-violet-300 transition-colors"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            bookmarked.has(candidate.id) ? "fill-violet-400 text-violet-400" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ─── AI Copilot Insight ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.12] to-fuchsia-500/[0.06] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Copilot Insight</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Frontend Engineer roles get 35% more qualified applicants when skills are clearly listed.
              </p>
            </div>
          </div>
          <button className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-500 transition-colors whitespace-nowrap">
            View Insight
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="absolute -bottom-16 -right-10 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />
        </motion.div>
      </div>

      {/* ─── Candidate Detail Modal ────────────────────────────────── */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] max-h-[75vh] overflow-y-auto z-50 rounded-2xl border border-white/[0.1] bg-[#0C0C16] shadow-2xl"
            >
              <div className={`h-1 bg-gradient-to-r ${scoreGradient(selectedCandidate.scores.thinkRank)}`} />

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {selectedCandidate.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">{selectedCandidate.name}</h2>
                    <p className="text-sm text-gray-400">{selectedCandidate.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                        {archetypeIcon(selectedCandidate.archetype)}
                        {selectedCandidate.archetype}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${decisionColor(
                          selectedCandidate.decision
                        )}`}
                      >
                        {decisionIcon(selectedCandidate.decision)}
                        {selectedCandidate.decision}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-center">
                    <p
                      className={`text-4xl font-black bg-gradient-to-r ${scoreGradient(
                        selectedCandidate.scores.thinkRank
                      )} bg-clip-text text-transparent`}
                    >
                      {selectedCandidate.scores.thinkRank}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">ThinkRank Score</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { label: "Placement Readiness", val: selectedCandidate.scores.readiness },
                    { label: "Engineering Credibility", val: selectedCandidate.scores.credibility },
                    { label: "Recruiter Trust Index", val: selectedCandidate.scores.trustIndex },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{s.label}</span>
                        <span className="text-xs font-bold text-white">{s.val}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.val}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(s.val)}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/15 text-xs text-violet-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    <FileText className="w-4 h-4" />
                    View Full Report
                  </button>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
=======
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Compute live counts for filter pills dynamically from source data
  const counts = useMemo(() => {
    return {
      all: candidates.length,
      hire: candidates.filter(c => c.status === "hire").length,
      maybe: candidates.filter(c => c.status === "maybe").length,
      reject: candidates.filter(c => c.status === "reject").length,
    };
  }, [candidates]);

  // Combined Search + Status Filtering
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Status Filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      
      // Search Filter (Name, Role, OR Skill tags)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesRole = c.role.toLowerCase().includes(query);
        const matchesSkill = c.skills.some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesRole && !matchesSkill) return false;
      }
      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortOption === "thinkRank") return b.scores.thinkRank - a.scores.thinkRank;
      if (sortOption === "name") return a.name.localeCompare(b.name);
      // 'recent' uses array order (mocking chronological)
      return 0;
    });
  }, [candidates, statusFilter, debouncedSearch, sortOption]);

  // Slicing to prevent rendering hundreds of nodes (virtualization/pagination substitute for < 30)
  const MAX_DISPLAY = 30;
  const displayedCandidates = filteredCandidates.slice(0, MAX_DISPLAY);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-violet-500/30">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            Recruiter Command Center
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </h1>
          <p className="text-gray-400 text-sm">
            Review AI-evaluated candidates. Pipeline data is updated in real-time.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-white/5 animate-pulse rounded-xl" />
            <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl" />)}
            </div>
          </div>
        ) : (
          <>
            <StatsRow stats={stats} />
            <PipelineBar stats={stats} />

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {(["all", "hire", "maybe", "reject"] as const).map((status) => {
                  const isActive = statusFilter === status;
                  const count = counts[status];
                  // Distinct filled background for active state
                  const activeClass = isActive 
                    ? "bg-white text-black font-semibold border-white" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white";
                  
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${activeClass}`}
                      aria-pressed={isActive}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-black/10 text-black' : 'bg-black/30 text-gray-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search name, role, skills..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full md:w-64 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
                    aria-label="Search candidates"
                  />
                  {searchInput && (
                    <button 
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="appearance-none pl-4 pr-9 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                    aria-label="Sort candidates"
                  >
                    <option value="thinkRank">Highest ThinkRank</option>
                    <option value="recent">Most Recent</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Candidate List / Grid */}
            {displayedCandidates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {displayedCandidates.map(candidate => (
                    <CandidateCardComponent key={candidate.id} candidate={candidate} />
                  ))}
                </AnimatePresence>
                
                {/* Slicing notification if list exceeds MAX_DISPLAY */}
                {filteredCandidates.length > MAX_DISPLAY && (
                  <div className="col-span-full py-4 text-center text-sm text-gray-500">
                    Showing 30 of {filteredCandidates.length} candidates. Load more...
                  </div>
                )}
>>>>>>> main
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 px-4 border border-white/10 border-dashed rounded-xl bg-white/5">
                <User className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No candidates match</h3>
                <p className="text-gray-400 text-sm text-center max-w-sm mb-6">
                  We couldn't find anyone matching "{searchInput}" in the {statusFilter !== 'all' ? statusFilter : ''} status.
                </p>
                <button
                  onClick={() => {
                    setSearchInput("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
