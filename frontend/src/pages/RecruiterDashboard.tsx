import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Search,
  ChevronDown,
  X,
  User,
  Clock,
  CheckCircle2,
  XCircle,
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
  trustAlerts: 3, // Inverse metric (high is bad)
  conversionRate: 25,
  pipeline: {
    hire: 12,
    maybe: 18,
    reject: 18,
  },
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
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<"all" | "hire" | "maybe" | "reject">("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 150); // Debounce 150ms
  const [sortOption, setSortOption] = useState<SortOption>("thinkRank");

  // Simulate network fetch
  useEffect(() => {
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
