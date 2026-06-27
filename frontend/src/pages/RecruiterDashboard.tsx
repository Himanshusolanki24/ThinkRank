import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CandidateCard {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  archetype: string;
  scores: {
    thinkRank: number;
    readiness: number;
    credibility: number;
    trustIndex: number;
  };
  decision: "HIRE" | "MAYBE" | "REJECT";
  appliedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CANDIDATES: CandidateCard[] = [
  {
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
  },
  {
    id: "cand_4",
    name: "David Park",
    role: "ML Engineer",
    avatar: "DP",
    skills: ["Python", "PyTorch", "TensorFlow", "CUDA"],
    archetype: "AI Researcher",
    scores: { thinkRank: 91, readiness: 88, credibility: 93, trustIndex: 97 },
    decision: "HIRE",
    appliedAt: "3 hours ago",
  },
  {
    id: "cand_5",
    name: "Elena Torres",
    role: "DevOps Engineer",
    avatar: "ET",
    skills: ["AWS", "Terraform", "CI/CD", "Docker"],
    archetype: "DevOps Engineer",
    scores: { thinkRank: 85, readiness: 82, credibility: 88, trustIndex: 90 },
    decision: "HIRE",
    appliedAt: "8 hours ago",
  },
  {
    id: "cand_6",
    name: "Frank Lee",
    role: "Junior Developer",
    avatar: "FL",
    skills: ["JavaScript", "HTML", "CSS", "Node.js"],
    archetype: "Full Stack Generalist",
    scores: { thinkRank: 52, readiness: 48, credibility: 55, trustIndex: 40 },
    decision: "REJECT",
    appliedAt: "2 days ago",
  },
];

const PIPELINE_STATS = {
  totalEvaluated: 48,
  avgThinkRank: 82,
  trustAlerts: 2,
  conversionRate: "24%",
  conversionValue: 24,
  hireCount: 12,
  maybeCount: 18,
  rejectCount: 18,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function decisionColor(d: string) {
  if (d === "HIRE") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (d === "MAYBE") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

function decisionIcon(d: string) {
  if (d === "HIRE") return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (d === "MAYBE") return <Clock className="w-3.5 h-3.5" />;
  return <XCircle className="w-3.5 h-3.5" />;
}

function scoreGradient(score: number) {
  if (score >= 85) return "from-emerald-500 to-cyan-500";
  if (score >= 70) return "from-amber-500 to-orange-500";
  return "from-red-500 to-pink-500";
}

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
