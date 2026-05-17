/**
 * DailyTaskEngine — Adaptive daily coding/project/interview tasks
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ListChecks, Code2, FolderGit2, Mic, GitBranch, BookOpen, Layers,
  CheckCircle2, Circle, Clock, Flame, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DailyTask } from "@/data/placementGenomeData";

interface Props {
  tasks: DailyTask[];
}

const TASK_ICONS: Record<string, React.ElementType> = {
  coding: Code2,
  project: FolderGit2,
  interview: Mic,
  github: GitBranch,
  revision: BookOpen,
  system_design: Layers,
};

const TASK_COLORS: Record<string, string> = {
  coding: "#8B5CF6",
  project: "#EC4899",
  interview: "#06B6D4",
  github: "#10B981",
  revision: "#F59E0B",
  system_design: "#6366F1",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  hard: "text-red-400 bg-red-500/10",
};

export const DailyTaskEngine = ({ tasks }: Props) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const completed = localTasks.filter((t) => t.isCompleted).length;
  const totalXP = localTasks.reduce((s, t) => s + (t.isCompleted ? t.xpReward : 0), 0);
  const maxXP = localTasks.reduce((s, t) => s + t.xpReward, 0);
  const progress = (completed / localTasks.length) * 100;

  const toggleTask = (id: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111118] to-[#0A0A10] p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Today's AI Tasks</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-gray-400">{completed}/{localTasks.length}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-gray-400">{totalXP}/{maxXP} XP</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {localTasks.map((task, i) => {
          const Icon = TASK_ICONS[task.type] || Code2;
          const color = TASK_COLORS[task.type] || "#8B5CF6";
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                task.isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/[0.03] opacity-60"
                  : "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              {/* Check */}
              {task.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600 shrink-0" />
              )}

              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.isCompleted ? "line-through text-gray-500" : "text-white"}`}>
                  {task.title}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{task.description}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={`${DIFF_COLORS[task.difficulty]} text-[10px] px-1.5 py-0`}>
                  {task.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock className="w-2.5 h-2.5" />
                  {task.estimatedMinutes}m
                </div>
                <span className="text-[10px] text-yellow-400 font-medium">+{task.xpReward}xp</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
