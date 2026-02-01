import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import {
  User,
  Bell,
  Target,
  Zap,
  Trophy,
  Save,
  Edit,
  GraduationCap,
  Phone,
  Linkedin,
  Github,
  Loader2,
  Building,
  BookOpen,
  Flame,
  Star,
  ChevronRight,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  Code2,
  Sparkles,
  Settings,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react";

const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "Java", "C++", "HTML/CSS", "SQL", "MongoDB",
  "Git", "Docker", "AWS", "Machine Learning", "Data Analysis",
];

// Animated background gradient
const ProfileBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
    <div className="absolute top-40 -left-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[120px]" />
  </div>
);

// Animated stat card
const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  bgColor
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm hover:border-white/10 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </motion.div>
);

// Skill DNA visualization
const SkillDNA = ({ skills }: { skills: string[] }) => {
  return (
    <div className="relative py-8">
      {/* DNA Strand visualization */}
      <div className="flex flex-wrap gap-3 justify-center">
        {skills.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-violet-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/20 text-sm font-medium text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                {skill}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isProfileComplete } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    streakAlerts: false,
  });
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'settings'>('overview');
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    if (user?.id) {
      fetchActivityHeatmap();
    }
  }, [user?.id]);

  const fetchActivityHeatmap = async () => {
    if (!user?.id) return;
    setHeatmapLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-tasks/activity-heatmap/${user.id}`);
      const data = await parseApiResponse(response);
      if (data.success) {
        setActivityData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching activity heatmap:", error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setSelectedSkills(profile.skills || []);
    }
  }, [profile]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const newSkills = prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill];
      setHasChanges(true);
      return newSkills;
    });
  };

  const handleDifficultyChange = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    setHasChanges(true);
  };

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          skills: selectedSkills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setHasChanges(false);
      toast({
        title: "Changes saved! ✨",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving changes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const allSkills = Array.from(new Set([...selectedSkills, ...SKILL_SUGGESTIONS])).slice(0, 15);

  // Stats state
  const [stats, setStats] = useState({
    totalXp: 0,
    streak: 0,
    tasksCompleted: 0,
    interviewsDone: 0,
    skillsMastered: 0,
    rank: "Newcomer",
  });

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const { data: interviews, error: interviewError } = await supabase
          .from("interview_results")
          .select("*")
          .eq("user_id", user.id);

        if (!interviewError && interviews) {
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
            skillsMastered: masteredSkills || selectedSkills.length,
            rank,
          });
        }

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
    fetchStats();
  }, [user?.id, profile, selectedSkills.length]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <ProfileBackground />

      <main className="relative z-10 pt-8 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-cyan-600/30 rounded-3xl blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
              {/* Banner */}
              <div className="h-40 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

                {/* Edit Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/complete-profile")}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-0 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-6 lg:px-8 pb-8 -mt-16">
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-2xl border-4 border-[#0A0A0F] shadow-2xl overflow-hidden bg-white/[0.05]">
                      {profile?.avatar_url && !imageError ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || "User"}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                          <User className="w-16 h-16 text-white/80" />
                        </div>
                      )}
                    </div>

                    {/* Rank badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white shadow-lg"
                    >
                      {stats.rank}
                    </motion.div>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 pt-4 lg:pt-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold text-white">
                            {profile?.username || profile?.full_name || "Complete Your Profile"}
                          </h1>
                          {isProfileComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </motion.div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            {profile?.email || user?.email}
                          </span>
                          {profile?.academic_year && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {profile.academic_year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {isProfileComplete && profile && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.institute_name && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300">
                            <Building className="w-3.5 h-3.5 text-violet-400" />
                            {profile.institute_name}
                          </span>
                        )}
                        {profile.course && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            {profile.course}
                          </span>
                        )}
                        {profile.specialization && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                            {profile.specialization}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {profile?.short_bio && (
                      <p className="mt-4 text-gray-400 max-w-2xl">{profile.short_bio}</p>
                    )}

                    {/* Social Links */}
                    {isProfileComplete && profile && (
                      <div className="flex items-center gap-3 mt-4">
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-violet-500/20 hover:border-violet-500/30 transition-all"
                          >
                            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                          </a>
                        )}
                        {profile.github_username && (
                          <a
                            href={`https://github.com/${profile.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-violet-500/20 hover:border-violet-500/30 transition-all"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {profile.whatsapp_number && (
                          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300">
                            <Phone className="w-4 h-4 text-green-400" />
                            {profile.whatsapp_number}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            <StatCard icon={Star} value={stats.totalXp.toLocaleString()} label="Total XP" color="text-amber-400" bgColor="bg-amber-500/10" />
            <StatCard icon={Flame} value={stats.streak} label="Day Streak" color="text-orange-400" bgColor="bg-orange-500/10" />
            <StatCard icon={CheckCircle} value={stats.tasksCompleted} label="Tasks Done" color="text-emerald-400" bgColor="bg-emerald-500/10" />
            <StatCard icon={Award} value={stats.interviewsDone} label="Interviews" color="text-cyan-400" bgColor="bg-cyan-500/10" />
            <StatCard icon={Target} value={stats.skillsMastered} label="Skills" color="text-violet-400" bgColor="bg-violet-500/10" />
            <StatCard icon={TrendingUp} value={stats.rank} label="Rank" color="text-pink-400" bgColor="bg-pink-500/10" />
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Skill DNA Card */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Your Skill DNA</h3>
                      <p className="text-sm text-gray-400">{selectedSkills.length} active genes</p>
                    </div>
                  </div>
                  <SkillDNA skills={selectedSkills} />
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Quick Actions</h3>
                      <p className="text-sm text-gray-400">Continue your evolution</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/tasks')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">Daily Tasks</p>
                          <p className="text-sm text-gray-400">Complete your challenges</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => navigate('/interview')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">AI Interview</p>
                          <p className="text-sm text-gray-400">Practice with AI</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => navigate('/analytics')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">Analytics</p>
                          <p className="text-sm text-gray-400">View your progress</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Activity Heatmap - Full Width */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Activity Overview</h3>
                      <p className="text-sm text-gray-400">Your learning activity over the year</p>
                    </div>
                  </div>
                  <ActivityHeatmap data={activityData} loading={heatmapLoading} />
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Skills Selection */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Skills & Interests</h3>
                      <p className="text-sm text-gray-400">{selectedSkills.length} skills selected</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <motion.button
                        key={skill}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSkills.includes(skill)
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/25"
                          : "bg-white/[0.05] border border-white/[0.05] text-gray-400 hover:border-violet-500/50 hover:text-white"
                          }`}
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Difficulty Level</h3>
                      <p className="text-sm text-gray-400">Set your preferred challenge</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { level: "beginner", label: "Beginner", desc: "5-10 min tasks", gradient: "from-emerald-600 to-green-600" },
                      { level: "intermediate", label: "Intermediate", desc: "15-25 min tasks", gradient: "from-amber-600 to-orange-600" },
                      { level: "advanced", label: "Advanced", desc: "25-45 min tasks", gradient: "from-red-600 to-pink-600" },
                    ].map((item) => (
                      <motion.button
                        key={item.level}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleDifficultyChange(item.level as any)}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${difficulty === item.level
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : "bg-white/[0.03] border border-white/[0.05] hover:border-white/10"
                          }`}
                      >
                        <div>
                          <p className={`font-semibold ${difficulty === item.level ? "text-white" : "text-white"}`}>
                            {item.label}
                          </p>
                          <p className={`text-sm ${difficulty === item.level ? "text-white/80" : "text-gray-400"}`}>
                            {item.desc}
                          </p>
                        </div>
                        {difficulty === item.level && <CheckCircle className="w-5 h-5" />}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Notifications */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <p className="text-sm text-gray-400">Manage your alerts</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "dailyReminder", label: "Daily Reminder", desc: "Get reminded to practice" },
                      { key: "weeklyReport", label: "Weekly Report", desc: "Summary of your progress" },
                      { key: "achievements", label: "Achievements", desc: "When you unlock badges" },
                      { key: "streakAlerts", label: "Streak Alerts", desc: "Don't break your streak" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                      >
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Send Feedback</h3>
                      <p className="text-sm text-gray-400">Help us improve SkillGenome</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Feedback Type</label>
                      <select
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                        defaultValue=""
                      >
                        <option value="" disabled>Select feedback type</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Your Feedback</label>
                      <textarea
                        placeholder="Tell us what you think..."
                        rows={4}
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl">
                      <Mail className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
              >
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0A0A0F]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <span className="text-sm text-gray-400">You have unsaved changes</span>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Profile;
