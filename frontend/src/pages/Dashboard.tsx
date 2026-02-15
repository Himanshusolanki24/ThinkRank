import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Award,
  Zap,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
  Trophy,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Activity,
  Code2,
  Flame,
  Brain,
  Network,
  GitBranch,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
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

interface WeeklyData {
  day: string;
  xp: number;
}

interface SkillData {
  skill: string;
  value: number;
  fullMark: number;
}

interface FocusArea {
  name: string;
  level: number;
  improvement: string;
}

interface ExtractedSkill {
  name: string;
  color: string;
  textColor: string;
}



// Background component
const DashboardBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
    <div className="absolute top-60 -left-40 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
    <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
  </div>
);

// Stat card component
const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  trend,
  delay = 0
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
  trend?: string;
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
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </motion.div>
);

// Quick action button
const QuickAction = ({
  icon: Icon,
  title,
  description,
  to,
  gradient
}: {
  icon: any;
  title: string;
  description: string;
  to: string;
  gradient: string;
}) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white group-hover:text-violet-300 transition-colors">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyData[]>([]);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [stats, setStats] = useState({
    skillsMastered: 0,
    totalXp: 0,
    interviewsDone: 0,
    overallScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [graphView, setGraphView] = useState<"d3" | "cytoscape">("d3");

  const displayName = profile?.username || profile?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    const storedSkills = localStorage.getItem("extractedSkills");
    if (storedSkills) {
      try {
        const parsed = JSON.parse(storedSkills);
        const skillNames = parsed.skills?.map((s: ExtractedSkill) => s.name) || [];
        setExtractedSkills(skillNames);
      } catch (e) {
        console.error("Failed to parse stored skills", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.id, extractedSkills]);



  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      const { data: interviews, error: interviewError } = await supabase
        .from("interview_results")
        .select("*")
        .eq("user_id", user.id)
        .order("interview_date", { ascending: false });

      if (interviewError) {
        console.log("No interview results yet or error:", interviewError);
      }

      const interviewData = interviews || [];
      setInterviewResults(interviewData);

      if (interviewData.length > 0) {
        const totalXp = interviewData.reduce((sum, i) => sum + (i.xp_earned || 0), 0);
        const avgScore = interviewData.reduce((sum, i) => {
          const percentage = i.total_questions > 0
            ? (i.correct_answers / i.total_questions) * 100
            : 0;
          return sum + percentage;
        }, 0) / interviewData.length;

        const skillMap = new Map<string, { total: number; count: number; xp: number }>();
        extractedSkills.slice(0, 12).forEach((skillName) => {
          skillMap.set(skillName, { total: 0, count: 0, xp: 0 });
        });

        interviewData.forEach((interview) => {
          const existing = skillMap.get(interview.skill) || { total: 0, count: 0, xp: 0 };
          const score = interview.total_questions > 0
            ? (interview.correct_answers / interview.total_questions) * 100
            : 0;
          skillMap.set(interview.skill, {
            total: existing.total + score,
            count: existing.count + 1,
            xp: existing.xp + (interview.xp_earned || 0),
          });
        });

        const skills: SkillData[] = Array.from(skillMap.entries()).map(([skill, data]) => ({
          skill,
          value: data.count > 0 ? Math.round(data.total / data.count) : 0,
          fullMark: 100,
        }));
        setSkillData(skills);

        const sortedSkills = [...skills].sort((a, b) => a.value - b.value);
        const focus: FocusArea[] = sortedSkills.slice(0, 3).map((s) => ({
          name: s.skill,
          level: s.value,
          improvement: "+0%",
        }));
        setFocusAreas(focus);

        const masteredSkills = skills.filter(s => s.value >= 70).length;

        setStats({
          skillsMastered: masteredSkills,
          totalXp,
          interviewsDone: interviewData.length,
          overallScore: Math.round(avgScore),
        });
      } else if (extractedSkills.length > 0) {
        const skills: SkillData[] = extractedSkills.slice(0, 12).map((skillName) => ({
          skill: skillName,
          value: 0,
          fullMark: 100,
        }));
        setSkillData(skills);
      }

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const weekData: WeeklyData[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];

        const dayXp = interviewData
          .filter((interview) => {
            const interviewDate = new Date(interview.interview_date);
            return interviewDate.toDateString() === date.toDateString();
          })
          .reduce((sum, i) => sum + (i.xp_earned || 0), 0);

        weekData.push({ day: dayName, xp: dayXp });
      }
      setWeeklyProgress(weekData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for D3 and Cytoscape graphs
  const graphSkillData = skillData.map((s, i) => {
    const interviews = interviewResults.filter(ir => ir.skill === s.skill);
    const totalXp = interviews.reduce((sum, ir) => sum + (ir.xp_earned || 0), 0);
    return {
      id: `skill-${i}`,
      name: s.skill,
      level: s.value >= 70 ? 3 : s.value >= 40 ? 2 : 1,
      score: s.value,
      category: "",
      interviews: interviews.length,
      xp: totalXp,
    };
  });

  const cytoscapeData = skillData.map((s) => {
    const interviews = interviewResults.filter(ir => ir.skill === s.skill);
    const totalXp = interviews.reduce((sum, ir) => sum + (ir.xp_earned || 0), 0);
    return {
      name: s.skill,
      score: s.value,
      interviews: interviews.length,
      xp: totalXp,
    };
  });

  const defaultWeeklyProgress: WeeklyData[] = [
    { day: "Mon", xp: 0 },
    { day: "Tue", xp: 0 },
    { day: "Wed", xp: 0 },
    { day: "Thu", xp: 0 },
    { day: "Fri", xp: 0 },
    { day: "Sat", xp: 0 },
    { day: "Sun", xp: 0 },
  ];

  const displayWeeklyProgress = weeklyProgress.some((d) => d.xp > 0) ? weeklyProgress : defaultWeeklyProgress;
  const hasData = interviewResults.length > 0;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <DashboardBackground />

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
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{displayName}</span>
                </h1>
                <p className="text-gray-400">
                  {stats.skillsMastered > 0
                    ? `You've mastered ${stats.skillsMastered} skill${stats.skillsMastered > 1 ? 's' : ''}! Keep evolving.`
                    : "Start your learning journey by taking an interview!"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium">{profile?.streak_count || 0} Day Streak</span>
                </div>
                <Link to="/build">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build Genome
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Award}
              value={stats.skillsMastered}
              label="Skills Mastered"
              color="text-violet-400"
              bgColor="bg-violet-500/10"
              delay={0.1}
            />
            <StatCard
              icon={Zap}
              value={stats.totalXp.toLocaleString()}
              label="Total XP"
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              trend="+12%"
              delay={0.15}
            />
            <StatCard
              icon={Target}
              value={stats.interviewsDone}
              label="Interviews"
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
              delay={0.2}
            />
            <StatCard
              icon={TrendingUp}
              value={`${stats.overallScore}%`}
              label="Overall Score"
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              delay={0.25}
            />
          </div>

          {/* Skill Genome Graph - D3 or Cytoscape */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    {graphView === "d3" ? (
                      <Network className="w-5 h-5 text-violet-400" />
                    ) : (
                      <GitBranch className="w-5 h-5 text-violet-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {graphView === "d3" ? "Skill Network" : "Skill Relationships"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {graphView === "d3"
                        ? "Force-directed graph of your skills"
                        : "See how your skills connect"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGraphView("d3")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${graphView === "d3"
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Network View
                  </button>
                  <button
                    onClick={() => setGraphView("cytoscape")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${graphView === "cytoscape"
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Relationship View
                  </button>
                </div>
              </div>

              <div className="h-[450px]">
                {graphSkillData.length > 0 ? (
                  <AnimatePresence mode="wait">
                    {graphView === "d3" ? (
                      <motion.div
                        key="d3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <D3SkillNetwork
                          skills={graphSkillData}
                          onNodeClick={(skill) => console.log("Selected:", skill)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cytoscape"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <CytoscapeSkillGraph
                          skills={cytoscapeData}
                          onNodeSelect={(skill) => console.log("Selected:", skill)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Brain className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-2">No skill data yet</p>
                    <p className="text-sm text-gray-500 mb-4">Build your genome or take an interview to see your skill network</p>
                    <Link to="/interview">
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                        Start Your First Interview
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions & Focus Areas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Weekly Progress */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Weekly Progress</h3>
                    <p className="text-sm text-gray-400">
                      {hasData ? "XP earned this week" : "Your weekly XP will appear here"}
                    </p>
                  </div>
                </div>

                <div className="h-[200px] min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayWeeklyProgress}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(10, 10, 15, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="rgb(139, 92, 246)"
                        strokeWidth={2}
                        fill="url(#xpGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Recent Activity</h3>
                      <p className="text-sm text-gray-400">Your latest interviews</p>
                    </div>
                  </div>
                  <Link to="/analytics">
                    <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                      View All
                    </Button>
                  </Link>
                </div>

                {interviewResults.length > 0 ? (
                  <div className="space-y-3">
                    {interviewResults.slice(0, 4).map((interview) => {
                      const percentage = interview.total_questions > 0
                        ? Math.round((interview.correct_answers / interview.total_questions) * 100)
                        : 0;
                      const isPassed = percentage >= 60;

                      return (
                        <div
                          key={interview.id}
                          className={`flex items-center justify-between p-3 rounded-xl ${isPassed
                            ? "bg-emerald-500/5 border border-emerald-500/20"
                            : "bg-white/[0.02] border border-white/[0.05]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPassed ? "bg-emerald-500/10" : "bg-white/[0.05]"
                              }`}>
                              {isPassed ? (
                                <Trophy className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Code2 className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">
                                {interview.skill} Interview
                              </span>
                              <p className="text-xs text-gray-400">
                                {interview.correct_answers}/{interview.total_questions} correct • {percentage}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3" />
                            <span className="text-sm font-medium">{interview.xp_earned} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="w-10 h-10 text-gray-500 mb-3" />
                    <p className="text-sm text-gray-400 mb-4">No recent activity yet</p>
                    <Link to="/interview">
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Start Interview
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                  <QuickAction
                    icon={Zap}
                    title="Daily Tasks"
                    description="Complete challenges"
                    to="/tasks"
                    gradient="from-violet-600 to-purple-600"
                  />
                  <QuickAction
                    icon={Target}
                    title="AI Interview"
                    description="Practice with AI"
                    to="/interview"
                    gradient="from-cyan-600 to-blue-600"
                  />
                </div>
              </div>

              {/* Focus Areas */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Focus Areas</h3>
                    <p className="text-xs text-gray-400">Skills needing attention</p>
                  </div>
                </div>

                {focusAreas.length > 0 ? (
                  <div className="space-y-4">
                    {focusAreas.map((skill, index) => (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{skill.name}</span>
                          <span className="text-sm text-gray-400">{skill.level}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Complete interviews to identify focus areas
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
