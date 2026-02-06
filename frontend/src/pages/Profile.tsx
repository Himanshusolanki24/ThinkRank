import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import {
  User,
  Edit,
  GraduationCap,
  Linkedin,
  Github,
  Building,
  BookOpen,
  Flame,
  Star,
  Mail,
  Calendar,
  Award,
  Trophy,
  CheckCircle,
  Code2,
  MapPin,
  ExternalLink,
  TrendingUp,
  Zap,
  Target,
  Clock,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Circular progress for problem stats
const CircularProgress = ({
  value,
  max,
  color,
  label,
  size = 120,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: number;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            /{max}
          </span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
};

// Badge component
const Badge = ({
  icon: Icon,
  title,
  description,
  earned,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className={`
      relative p-4 rounded-xl border transition-all
      ${earned
        ? "bg-white/[0.03] border-white/10 hover:border-white/20"
        : "bg-white/[0.01] border-white/[0.04] opacity-40"
      }
    `}
  >
    <div
      className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-3
        ${earned ? color : "bg-gray-800"}
      `}
    >
      <Icon className={`w-6 h-6 ${earned ? "text-white" : "text-gray-600"}`} />
    </div>
    <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-500">{description}</p>
    {earned && (
      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-white" />
      </div>
    )}
  </motion.div>
);

// Skill bar component
const SkillBar = ({
  name,
  level,
  maxLevel = 100,
  color,
}: {
  name: string;
  level: number;
  maxLevel?: number;
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-300">{name}</span>
      <span className="text-xs text-gray-500">
        {level}/{maxLevel}
      </span>
    </div>
    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(level / maxLevel) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isProfileComplete } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false); // Don't show loading - render immediately
  const [stats, setStats] = useState({
    totalXp: 0,
    streak: 0,
    tasksCompleted: 0,
    interviewsDone: 0,
    skillsMastered: 0,
    rank: "Newcomer",
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
    totalProblems: 0,
  });

  useEffect(() => {
    refreshProfile();
    if (user?.id) {
      fetchActivityHeatmap();
      fetchStats();
    }
  }, [user?.id]);

  const fetchActivityHeatmap = async () => {
    if (!user?.id) return;
    // Don't set loading - show empty heatmap immediately
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(
        `${API_BASE_URL}/api/daily-tasks/activity-heatmap/${user.id}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const data = await parseApiResponse(response);
      if (data.success) {
        setActivityData(data.data || []);
      }
    } catch (error) {
      // Silently fail - heatmap will show with no data
      console.error("Error fetching activity heatmap:", error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const { data: interviews, error } = await supabase
        .from("interview_results")
        .select("*")
        .eq("user_id", user.id);

      if (!error && interviews) {
        const totalXp = interviews.reduce((sum, i) => sum + (i.xp_earned || 0), 0);
        const skillScores = new Map<string, number>();
        interviews.forEach((interview) => {
          const percentage = interview.total_questions > 0
            ? (interview.correct_answers / interview.total_questions) * 100
            : 0;
          const existing = skillScores.get(interview.skill) || 0;
          skillScores.set(interview.skill, Math.max(existing, percentage));
        });
        const masteredSkills = Array.from(skillScores.values()).filter(score => score >= 70).length;

        // Simulate problem difficulty distribution based on interview data
        const easy = Math.floor(interviews.length * 0.5);
        const medium = Math.floor(interviews.length * 0.35);
        const hard = interviews.length - easy - medium;

        let rank = "Newcomer";
        if (totalXp >= 5000) rank = "Legend";
        else if (totalXp >= 2500) rank = "Expert";
        else if (totalXp >= 1000) rank = "Rising Star";
        else if (totalXp >= 500) rank = "Learner";
        else if (totalXp >= 100) rank = "Explorer";

        setStats({
          totalXp: profile?.total_xp || totalXp,
          streak: profile?.streak_count || 0,
          tasksCompleted: 0,
          interviewsDone: interviews.length,
          skillsMastered: masteredSkills || (profile?.skills?.length || 0),
          rank,
          easyProblems: easy,
          mediumProblems: medium,
          hardProblems: hard,
          totalProblems: interviews.length,
        });
      }

      // Fetch tasks completed
      try {
        const { count } = await supabase
          .from("task_completions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (count !== null) {
          setStats(prev => ({ ...prev, tasksCompleted: count }));
        }
      } catch (e) {
        console.log("task_completions table not available");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const badges = [
    { icon: Flame, title: "7 Day Streak", description: "Practice 7 days in a row", earned: stats.streak >= 7, color: "bg-gradient-to-br from-orange-500 to-red-500" },
    { icon: Trophy, title: "First Interview", description: "Complete your first interview", earned: stats.interviewsDone >= 1, color: "bg-gradient-to-br from-amber-500 to-yellow-500" },
    { icon: Star, title: "XP Master", description: "Earn 1000+ XP points", earned: stats.totalXp >= 1000, color: "bg-gradient-to-br from-violet-500 to-purple-500" },
    { icon: Target, title: "Skill Hunter", description: "Master 5+ skills", earned: stats.skillsMastered >= 5, color: "bg-gradient-to-br from-emerald-500 to-green-500" },
    { icon: Zap, title: "Task Machine", description: "Complete 50+ tasks", earned: stats.tasksCompleted >= 50, color: "bg-gradient-to-br from-cyan-500 to-blue-500" },
    { icon: Award, title: "Legend", description: "Reach Legend rank", earned: stats.rank === "Legend", color: "bg-gradient-to-br from-pink-500 to-rose-500" },
  ];

  const skills = profile?.skills?.slice(0, 6).map((skill, i) => ({
    name: skill,
    level: Math.floor(40 + Math.random() * 60), // Simulated - replace with real data
    color: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"][i % 6],
  })) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Sidebar - User Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
            >
              {/* Avatar */}
              <div className="relative w-full aspect-square max-w-[180px] mx-auto mb-6">
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/10">
                  {profile?.avatar_url && !imageError ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                      <User className="w-20 h-20 text-white/60" />
                    </div>
                  )}
                </div>
                {/* Rank Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                  {stats.rank}
                </div>
              </div>

              {/* Name & Username */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-1">
                  {profile?.full_name || "Set Your Name"}
                </h1>
                <p className="text-gray-500 text-sm">
                  @{profile?.username || "username"}
                </p>
                {isProfileComplete && (
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile?.short_bio && (
                <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                  {profile.short_bio}
                </p>
              )}

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                onClick={() => navigate("/complete-profile")}
                className="w-full bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-violet-500/30 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

              {/* Divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Info List */}
              <div className="space-y-4">
                {profile?.institute_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 truncate">{profile.institute_name}</span>
                  </div>
                )}
                {profile?.course && (
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{profile.course}</span>
                  </div>
                )}
                {profile?.academic_year && (
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{profile.academic_year}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300 truncate">{profile?.email || user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">
                    Joined {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              {(profile?.linkedin_url || profile?.github_username) && (
                <>
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="flex items-center gap-3">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/20 text-[#0A66C2] text-sm font-medium transition-all"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.github_username && (
                      <a
                        href={`https://github.com/${profile.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-gray-300 text-sm font-medium transition-all"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Languages/Skills Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Languages</h3>
                <button className="text-xs text-violet-400 hover:underline">View all</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || ["JavaScript", "Python", "React"]).slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
            >
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                {/* Circular Progress */}
                <div className="flex items-center justify-center">
                  <CircularProgress
                    value={stats.totalProblems}
                    max={Math.max(100, stats.totalProblems + 50)}
                    color="#8B5CF6"
                    label="Solved"
                    size={120}
                  />
                </div>

                {/* Problem Stats */}
                <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 w-full">
                  <div className="text-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-400">{stats.easyProblems}</p>
                    <p className="text-xs text-gray-500 mt-1">Easy</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-2xl font-bold text-amber-400">{stats.mediumProblems}</p>
                    <p className="text-xs text-gray-500 mt-1">Medium</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-2xl font-bold text-red-400">{stats.hardProblems}</p>
                    <p className="text-xs text-gray-500 mt-1">Hard</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[180px]">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.totalXp.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total XP</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.streak}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.interviewsDone}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Interviews</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-violet-400 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.skillsMastered}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Skills</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Activity</h3>
                    <p className="text-xs text-gray-500">
                      {activityData.reduce((sum, d) => sum + d.count, 0)} contributions this year
                    </p>
                  </div>
                </div>
              </div>
              <ActivityHeatmap data={activityData} loading={heatmapLoading} />
            </motion.div>

            {/* Skills Progress */}
            {skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Skills Progress</h3>
                    <p className="text-xs text-gray-500">Your mastery levels</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {skills.map((skill, i) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      color={skill.color}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-[#12121a] border border-white/[0.06]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Badges</h3>
                  <p className="text-xs text-gray-500">
                    {badges.filter(b => b.earned).length} of {badges.length} earned
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Badge key={badge.title} {...badge} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
