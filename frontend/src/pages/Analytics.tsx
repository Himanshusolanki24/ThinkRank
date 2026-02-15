import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Brain,
  Sparkles,
  Activity,
  ChevronRight,
  BarChart3,
  PieChartIcon,
  GitBranch,
  Network,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { D3SkillNetwork } from "@/components/D3SkillNetwork";
import { CytoscapeSkillGraph } from "@/components/CytoscapeSkillGraph";

interface InterviewResult {
  id: string;
  skill: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  interview_date: string;
  xp_earned: number;
}

interface SkillGrowthData {
  skill: string;
  questionsThisMonth: number;
  percentage: number;
}

interface ScoreTrendData {
  label: string;
  score: number;
}

interface SkillDistributionData {
  name: string;
  value: number;
  color: string;
}

const SKILL_COLORS = [
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
];

// Background component
const AnalyticsBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
    <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px]" />
    <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-purple-600/6 rounded-full blur-[100px]" />
  </div>
);

// Stat card
const StatCard = ({
  icon: Icon,
  value,
  label,
  change,
  changeLabel,
  color,
  bgColor,
  delay = 0,
}: {
  icon: any;
  value: string | number;
  label: string;
  change?: number;
  changeLabel?: string;
  color: string;
  bgColor: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:border-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change}{changeLabel || "%"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </motion.div>
);

const Analytics = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [graphView, setGraphView] = useState<"d3" | "cytoscape" | "charts">("d3");

  const [stats, setStats] = useState({
    overallScore: 0,
    overallScoreChange: 0,
    monthlyXp: 0,
    monthlyXpChange: 0,
    tasksThisMonth: 0,
    tasksChange: 0,
    careerReadiness: 0,
  });

  const [scoreTrend, setScoreTrend] = useState<ScoreTrendData[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<SkillDistributionData[]>([]);
  const [skillGrowth, setSkillGrowth] = useState<SkillGrowthData[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "6months">("month");

  useEffect(() => {
    const storedSkills = localStorage.getItem("extractedSkills");
    if (storedSkills) {
      try {
        const parsed = JSON.parse(storedSkills);
        const skillNames = parsed.skills?.map((s: { name: string }) => s.name) || [];
        setExtractedSkills(skillNames);
      } catch (e) {
        console.error("Failed to parse stored skills", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [user?.id, timeRange, extractedSkills]);

  const fetchAnalyticsData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data: interviews, error } = await supabase
        .from("interview_results")
        .select("*")
        .eq("user_id", user.id)
        .order("interview_date", { ascending: true });

      if (error) {
        console.error("Error fetching interview results:", error);
        setLoading(false);
        return;
      }

      const data = interviews || [];
      setInterviewResults(data);

      calculateStats(data);
      calculateScoreTrend(data);
      calculateSkillDistribution(data);
      calculateSkillGrowth(data);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: InterviewResult[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthData = data.filter(d => {
      const date = new Date(d.interview_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const lastMonthData = data.filter(d => {
      const date = new Date(d.interview_date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const overallScore = data.length > 0
      ? Math.round(data.reduce((sum, d) => {
        const pct = d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0;
        return sum + pct;
      }, 0) / data.length)
      : 0;

    const lastMonthScore = lastMonthData.length > 0
      ? Math.round(lastMonthData.reduce((sum, d) => {
        const pct = d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0;
        return sum + pct;
      }, 0) / lastMonthData.length)
      : 0;

    const overallScoreChange = lastMonthScore > 0 ? overallScore - lastMonthScore : 0;
    const monthlyXp = thisMonthData.reduce((sum, d) => sum + (d.xp_earned || 0), 0);
    const lastMonthXp = lastMonthData.reduce((sum, d) => sum + (d.xp_earned || 0), 0);
    const monthlyXpChange = monthlyXp - lastMonthXp;
    const tasksThisMonth = thisMonthData.length;
    const tasksLastMonth = lastMonthData.length;
    const tasksChange = tasksThisMonth - tasksLastMonth;

    const skillScores = new Map<string, number[]>();
    data.forEach(d => {
      const pct = d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0;
      const existing = skillScores.get(d.skill) || [];
      skillScores.set(d.skill, [...existing, pct]);
    });

    let masteredSkills = 0;
    skillScores.forEach(scores => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore >= 70) masteredSkills++;
    });

    const totalSkills = Math.max(skillScores.size, 1);
    const careerReadiness = Math.round((masteredSkills / totalSkills) * 100);

    setStats({
      overallScore,
      overallScoreChange,
      monthlyXp,
      monthlyXpChange,
      tasksThisMonth,
      tasksChange,
      careerReadiness,
    });
  };

  const calculateScoreTrend = (data: InterviewResult[]) => {
    const now = new Date();
    const trendData: ScoreTrendData[] = [];

    if (timeRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayData = data.filter(d => new Date(d.interview_date).toDateString() === date.toDateString());
        const avgScore = dayData.length > 0
          ? Math.round(dayData.reduce((sum, d) => sum + (d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0), 0) / dayData.length)
          : 0;
        trendData.push({ label: dayName, score: avgScore });
      }
    } else if (timeRange === "month") {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekData = data.filter(d => {
          const date = new Date(d.interview_date);
          return date >= weekStart && date < weekEnd;
        });
        const avgScore = weekData.length > 0
          ? Math.round(weekData.reduce((sum, d) => sum + (d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0), 0) / weekData.length)
          : 0;
        trendData.push({ label: `Week ${4 - i}`, score: avgScore });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
        const monthData = data.filter(d => {
          const date = new Date(d.interview_date);
          return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
        });
        const avgScore = monthData.length > 0
          ? Math.round(monthData.reduce((sum, d) => sum + (d.total_questions > 0 ? (d.correct_answers / d.total_questions) * 100 : 0), 0) / monthData.length)
          : 0;
        trendData.push({ label: monthName, score: avgScore });
      }
    }

    setScoreTrend(trendData);
  };

  const calculateSkillDistribution = (data: InterviewResult[]) => {
    const skillCounts = new Map<string, number>();
    data.forEach(d => skillCounts.set(d.skill, (skillCounts.get(d.skill) || 0) + 1));
    const total = data.length || 1;
    const distribution: SkillDistributionData[] = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill, count], index) => ({
        name: skill,
        value: Math.round((count / total) * 100),
        color: SKILL_COLORS[index % SKILL_COLORS.length],
      }));
    setSkillDistribution(distribution);
  };

  const calculateSkillGrowth = (data: InterviewResult[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthData = data.filter(d => {
      const date = new Date(d.interview_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const skillQuestions = new Map<string, { total: number; correct: number }>();
    extractedSkills.forEach(name => skillQuestions.set(name, { total: 0, correct: 0 }));
    thisMonthData.forEach(d => {
      const existing = skillQuestions.get(d.skill) || { total: 0, correct: 0 };
      skillQuestions.set(d.skill, { total: existing.total + d.total_questions, correct: existing.correct + d.correct_answers });
    });

    const growth: SkillGrowthData[] = Array.from(skillQuestions.entries())
      .map(([skill, data]) => ({
        skill,
        questionsThisMonth: data.total,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.questionsThisMonth - a.questionsThisMonth)
      .slice(0, 10);
    setSkillGrowth(growth);
  };

  // Prepare graph data
  const graphSkillData = skillGrowth.map((s, i) => {
    const interviews = interviewResults.filter(ir => ir.skill === s.skill);
    const totalXp = interviews.reduce((sum, ir) => sum + (ir.xp_earned || 0), 0);
    return {
      id: `skill-${i}`,
      name: s.skill,
      level: s.percentage >= 70 ? 3 : s.percentage >= 40 ? 2 : 1,
      score: s.percentage,
      category: "",
      interviews: interviews.length,
      xp: totalXp,
    };
  });

  const cytoscapeData = skillGrowth.map((s) => {
    const interviews = interviewResults.filter(ir => ir.skill === s.skill);
    const totalXp = interviews.reduce((sum, ir) => sum + (ir.xp_earned || 0), 0);
    return {
      name: s.skill,
      score: s.percentage,
      interviews: interviews.length,
      xp: totalXp,
    };
  });

  const careerReadinessData = [{ name: "Readiness", value: stats.careerReadiness, fill: "#8B5CF6" }];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <AnalyticsBackground />

      <main className="relative z-10 pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Analytics & Progress</h1>
                  <p className="text-gray-400">Track your skill evolution with interactive graphs</p>
                </div>
              </div>

              <Link to="/dashboard">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                  <Activity className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={TrendingUp} value={`${stats.overallScore}%`} label="Overall Score" change={stats.overallScoreChange} color="text-violet-400" bgColor="bg-violet-500/10" delay={0.1} />
            <StatCard icon={Zap} value={stats.monthlyXp.toLocaleString()} label="Monthly XP" change={stats.monthlyXpChange} changeLabel=" XP" color="text-amber-400" bgColor="bg-amber-500/10" delay={0.15} />
            <StatCard icon={Target} value={stats.tasksThisMonth} label="Interviews This Month" change={stats.tasksChange} changeLabel="" color="text-cyan-400" bgColor="bg-cyan-500/10" delay={0.2} />
            <StatCard icon={Award} value={`${stats.careerReadiness}%`} label="Career Readiness" color="text-emerald-400" bgColor="bg-emerald-500/10" delay={0.25} />
          </div>

          {/* Skill Graph Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Network className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Skill Analysis</h3>
                    <p className="text-sm text-gray-400">Interactive skill visualization</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { key: "d3", label: "Network Graph", icon: Network },
                    { key: "cytoscape", label: "Relationship Map", icon: GitBranch },
                    { key: "charts", label: "Traditional Charts", icon: BarChart3 },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setGraphView(key as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${graphView === key
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[450px]">
                <AnimatePresence mode="wait">
                  {graphView === "d3" && graphSkillData.length > 0 && (
                    <motion.div key="d3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                      <D3SkillNetwork skills={graphSkillData} />
                    </motion.div>
                  )}
                  {graphView === "cytoscape" && cytoscapeData.length > 0 && (
                    <motion.div key="cytoscape" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                      <CytoscapeSkillGraph skills={cytoscapeData} />
                    </motion.div>
                  )}
                  {graphView === "charts" && (
                    <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid lg:grid-cols-2 gap-4">
                      {/* Score Trend */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-white">Score Trend</h4>
                          <div className="flex gap-1">
                            {(["week", "month", "6months"] as const).map((range) => (
                              <button key={range} onClick={() => setTimeRange(range)} className={`px-2 py-1 rounded-lg text-xs ${timeRange === range ? "bg-violet-500/20 text-violet-400" : "text-gray-400 hover:text-white"}`}>
                                {range === "week" ? "W" : range === "month" ? "M" : "6M"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-[160px] min-h-[160px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scoreTrend}>
                              <defs>
                                <linearGradient id="scoreGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                              <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} fill="url(#scoreGradientAnalytics)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      {/* Skill Distribution */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <h4 className="font-medium text-white mb-4">Skill Distribution</h4>
                        <div className="h-[160px] flex items-center">
                          {skillDistribution.length > 0 ? (
                            <>
                              <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                  <Pie data={skillDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {skillDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="flex-1 space-y-2">
                                {skillDistribution.slice(0, 4).map(item => (
                                  <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-gray-300 truncate">{item.name}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{item.value}%</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center w-full text-gray-500 text-sm">No data</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {(graphView === "d3" || graphView === "cytoscape") && graphSkillData.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Brain className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-gray-400 mb-4">No skill data available yet</p>
                      <Link to="/interview">
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">Start Interviewing</Button>
                      </Link>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skill Growth */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-2">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Skill Growth This Month</h3>
                    <p className="text-sm text-gray-400">Success rate per skill</p>
                  </div>
                </div>
                <div className="h-[280px] min-h-[280px]">
                  {skillGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillGrowth} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                        <YAxis dataKey="skill" type="category" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(10,10,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} formatter={(value: number) => [`${value}%`, "Success Rate"]} />
                        <Bar dataKey="percentage" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Target className="w-12 h-12 text-gray-600 mb-4" />
                      <p className="text-gray-400">Complete interviews to see growth</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Career Readiness Gauge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Career Readiness</h3>
                    <p className="text-sm text-gray-400">Overall mastery</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={careerReadinessData} startAngle={90} endAngle={-270}>
                        <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">{stats.careerReadiness}%</span>
                      <span className="text-sm text-gray-400">{stats.careerReadiness >= 70 ? "Expert" : stats.careerReadiness >= 40 ? "Growing" : "Beginner"}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 mb-4">Skills with 70%+ avg score</p>
                    <Link to="/interview">
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                        Improve Score <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
