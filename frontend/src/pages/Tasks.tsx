import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Target,
  CheckCircle,
  Clock,
  Star,
  Flame,
  ChevronRight,
  Sparkles,
  Trophy,
  Loader2,
  BookOpen,
  ArrowRight,
  Award,
  Filter,
  Code2,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";

interface Task {
  id: string;
  technology: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  question: string;
  hint: string;
  xp_reward: number;
  expected_time_minutes: number;
  completed?: boolean;
}

const difficultyConfig = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-500",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500 to-orange-500",
  },
  advanced: {
    label: "Advanced",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500 to-pink-500",
  },
};

const TECHNOLOGIES = ["all", "JavaScript", "TypeScript", "HTML", "CSS", "React", "C", "Python"];

// Background component
const TasksBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
    <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px]" />
    <div className="absolute bottom-20 right-1/3 w-[350px] h-[350px] bg-purple-600/6 rounded-full blur-[100px]" />
  </div>
);

// Filter pill component
const FilterPill = ({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
        : "bg-white/[0.03] text-gray-400 border border-white/[0.05] hover:border-white/10 hover:text-white"
      }`}
  >
    {children}
  </motion.button>
);

// Task card component
const TaskCard = ({
  task,
  index,
  onStart
}: {
  task: Task;
  index: number;
  onStart: (task: Task) => void;
}) => {
  const config = difficultyConfig[task.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className={`relative p-5 rounded-2xl bg-white/[0.02] border backdrop-blur-sm transition-all duration-300 ${task.completed
          ? "border-emerald-500/30 bg-emerald-500/[0.02]"
          : "border-white/[0.05] hover:border-white/10"
        }`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {config.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Code2 className="w-3 h-3" />
                {task.technology}
              </span>
            </div>
            <h3 className="font-semibold text-white line-clamp-2 group-hover:text-violet-300 transition-colors">
              {task.question}
            </h3>
          </div>

          {task.completed && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        {task.hint && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            <span className="text-violet-400">Hint:</span> {task.hint}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              ~{task.expected_time_minutes} min
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
              <Star className="w-4 h-4" />
              {task.xp_reward} XP
            </span>
          </div>

          {task.completed ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <Trophy className="w-4 h-4" />
              Completed
            </span>
          ) : (
            <Button
              onClick={() => onStart(task)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-sm"
              size="sm"
            >
              Start Task
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalXpToday, setTotalXpToday] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [selectedDifficulty, selectedTech]);

  useEffect(() => {
    if (user?.id) {
      fetchCompletedTasks();
      fetchStreak();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const techParam = selectedTech !== "all" ? `technology=${selectedTech}` : "";
      const diffParam = selectedDifficulty !== "all" ? `difficulty=${selectedDifficulty}` : "";
      const params = [techParam, diffParam].filter(Boolean).join("&");

      const response = await fetch(`${API_BASE_URL}/api/daily-tasks/tasks?${params}`);
      const data = await parseApiResponse(response);

      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-tasks/streak/${user?.id}`);
      const data = await parseApiResponse(response);
      if (data.success) {
        setStreak(data.data.currentStreak || 0);
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-tasks/completed/${user?.id}`);
      const data = await parseApiResponse(response);
      if (data.success) {
        setCompletedTaskIds(data.data.completedTaskIds || []);
        setTotalXpToday(data.data.totalXpToday || 0);
      }
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    }
  };

  const completedSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);
  const filteredTasks = useMemo(() => tasks.map(task => ({
    ...task,
    completed: completedSet.has(task.id)
  })), [tasks, completedSet]);

  const completedCount = completedTaskIds.length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / Math.min(tasks.length, 10)) * 100) : 0;

  const handleStartTask = (task: Task) => {
    if (!user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to start tasks.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("currentTask", JSON.stringify(task));
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <TasksBackground />

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
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Daily Tasks</h1>
                    <p className="text-gray-400">Complete micro-tasks to strengthen your skills</p>
                  </div>
                </div>
              </div>

              {/* Stats Pills */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-white">{streak}</span>
                  <span className="text-sm text-gray-400">Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <Zap className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold text-white">{totalXpToday}</span>
                  <span className="text-sm text-gray-400">XP Today</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            {/* Technology Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400 mr-2">
                <Filter className="w-4 h-4" />
                <span>Technology:</span>
              </div>
              {TECHNOLOGIES.map((tech) => (
                <FilterPill
                  key={tech}
                  active={selectedTech === tech}
                  onClick={() => setSelectedTech(tech)}
                >
                  {tech === "all" ? "All" : tech}
                </FilterPill>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400 mr-2">
                <Target className="w-4 h-4" />
                <span>Difficulty:</span>
              </div>
              {["all", "beginner", "intermediate", "advanced"].map((diff) => (
                <FilterPill
                  key={diff}
                  active={selectedDifficulty === diff}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff === "all" ? "All Tasks" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </FilterPill>
              ))}
            </div>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Today's Progress</h3>
                    <p className="text-gray-400">{completedCount} tasks completed</p>
                  </div>
                </div>

                <div className="flex-1 max-w-md w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-6 h-6 text-amber-400" />
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {totalXpToday}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">XP Earned Today</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
              <p className="text-gray-400">Loading tasks...</p>
            </div>
          )}

          {/* Tasks Grid */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredTasks.slice(0, 12).map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onStart={handleStartTask}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Tasks Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or check back later for new tasks.</p>
              <Button
                onClick={() => {
                  setSelectedDifficulty("all");
                  setSelectedTech("all");
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                Reset Filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tasks;
