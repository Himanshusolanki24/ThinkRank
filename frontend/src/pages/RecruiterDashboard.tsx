import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Star,
  Eye,
  FileText,
  BarChart3,
  Brain,
  Code2,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  Award,
  GitBranch,
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
    role: "Senior Full-Stack Engineer",
    avatar: "AV",
    skills: ["TypeScript", "Next.js", "Docker", "PostgreSQL"],
    archetype: "Full Stack Generalist",
    scores: { thinkRank: 94, readiness: 92, credibility: 95, trustIndex: 98 },
    decision: "HIRE",
    appliedAt: "2 hours ago",
  },
  {
    id: "cand_2",
    name: "Bob Chen",
    role: "Backend Engineer",
    avatar: "BC",
    skills: ["Go", "Kubernetes", "Redis", "Kafka"],
    archetype: "Backend Wizard",
    scores: { thinkRank: 88, readiness: 85, credibility: 90, trustIndex: 92 },
    decision: "HIRE",
    appliedAt: "5 hours ago",
  },
  {
    id: "cand_3",
    name: "Chloe Smith",
    role: "Frontend Engineer",
    avatar: "CS",
    skills: ["React", "CSS", "Tailwind", "Figma"],
    archetype: "Frontend Specialist",
    scores: { thinkRank: 78, readiness: 76, credibility: 72, trustIndex: 95 },
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

function archetypeIcon(archetype: string) {
  if (archetype.includes("Backend")) return <Code2 className="w-3.5 h-3.5" />;
  if (archetype.includes("Frontend")) return <Eye className="w-3.5 h-3.5" />;
  if (archetype.includes("AI")) return <Brain className="w-3.5 h-3.5" />;
  if (archetype.includes("DevOps")) return <GitBranch className="w-3.5 h-3.5" />;
  return <Zap className="w-3.5 h-3.5" />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<CandidateCard[]>(MOCK_CANDIDATES);
  const [filterDecision, setFilterDecision] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = candidates.filter((c) => {
    const matchDecision = filterDecision === "ALL" || c.decision === filterDecision;
    const matchSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDecision && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#060611] text-white px-4 md:px-8 py-6 overflow-y-auto">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Recruiter Copilot
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered talent pipeline · Real-time candidate intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Live Pipeline</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Evaluated",
            value: PIPELINE_STATS.totalEvaluated,
            icon: Users,
            color: "from-violet-500 to-purple-600",
            accent: "text-violet-400",
          },
          {
            label: "Avg ThinkRank",
            value: PIPELINE_STATS.avgThinkRank,
            icon: TrendingUp,
            color: "from-cyan-500 to-blue-600",
            accent: "text-cyan-400",
            suffix: "/100",
          },
          {
            label: "Trust Alerts",
            value: PIPELINE_STATS.trustAlerts,
            icon: AlertTriangle,
            color: "from-amber-500 to-orange-600",
            accent: "text-amber-400",
          },
          {
            label: "Conversion Rate",
            value: PIPELINE_STATS.conversionRate,
            icon: Target,
            color: "from-emerald-500 to-teal-600",
            accent: "text-emerald-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-gray-500">{stat.suffix}</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            {/* Decorative glow */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.04] blur-2xl`}
            />
          </motion.div>
        ))}
      </div>

      {/* ─── Pipeline Mini-bar ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 mb-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
      >
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-2">
          Pipeline
        </span>
        <div className="flex-1 flex items-center gap-1 h-3 rounded-full overflow-hidden bg-white/[0.03]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full"
            style={{ width: `${(PIPELINE_STATS.hireCount / PIPELINE_STATS.totalEvaluated) * 100}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
            style={{ width: `${(PIPELINE_STATS.maybeCount / PIPELINE_STATS.totalEvaluated) * 100}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-r-full"
            style={{ width: `${(PIPELINE_STATS.rejectCount / PIPELINE_STATS.totalEvaluated) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> {PIPELINE_STATS.hireCount} Hire
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> {PIPELINE_STATS.maybeCount} Maybe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> {PIPELINE_STATS.rejectCount} Reject
          </span>
        </div>
      </motion.div>

      {/* ─── Filters & Search ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidates or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "HIRE", "MAYBE", "REJECT"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDecision(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterDecision === d
                  ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                  : "bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Candidate Grid ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((candidate, i) => (
              <motion.div
                key={candidate.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCandidate(candidate)}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all cursor-pointer overflow-hidden"
              >
                {/* Top Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${scoreGradient(
                    candidate.scores.thinkRank
                  )}`}
                />

                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                        {candidate.avatar}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-gray-500">{candidate.role}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${decisionColor(
                        candidate.decision
                      )}`}
                    >
                      {decisionIcon(candidate.decision)}
                      {candidate.decision}
                    </span>
                  </div>

                  {/* Archetype */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400">
                      {archetypeIcon(candidate.archetype)}
                      {candidate.archetype}
                    </span>
                    <span className="text-[10px] text-gray-600">· {candidate.appliedAt}</span>
                  </div>

                  {/* Score Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "ThinkRank", val: candidate.scores.thinkRank },
                      { label: "Readiness", val: candidate.scores.readiness },
                      { label: "Credibility", val: candidate.scores.credibility },
                      { label: "Trust", val: candidate.scores.trustIndex },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <span className="text-[10px] text-gray-500">{s.label}</span>
                        <span
                          className={`text-xs font-bold ${
                            s.val >= 85
                              ? "text-emerald-400"
                              : s.val >= 70
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {s.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/15 text-[10px] text-violet-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-violet-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No candidates match your filters.</p>
        </div>
      )}

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
              {/* Modal Top Gradient */}
              <div
                className={`h-1 bg-gradient-to-r ${scoreGradient(selectedCandidate.scores.thinkRank)}`}
              />

              <div className="p-6">
                {/* Header */}
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

                {/* Big Score */}
                <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-center">
                    <p
                      className={`text-4xl font-black bg-gradient-to-r ${scoreGradient(
                        selectedCandidate.scores.thinkRank
                      )} bg-clip-text text-transparent`}
                    >
                      {selectedCandidate.scores.thinkRank}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                      ThinkRank Score
                    </p>
                  </div>
                </div>

                {/* Score Bars */}
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

                {/* Skills */}
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

                {/* Actions */}
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
