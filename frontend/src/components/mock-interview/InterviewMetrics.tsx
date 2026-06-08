/**
 * InterviewMetrics — AI confidence meter, phase tracker, question counter,
 * listening indicator, and AI emotional state.
 */
import { motion } from "framer-motion";
import { Brain, Target, Zap, Ear, Sparkles } from "lucide-react";

interface Props {
  phase: string;
  questionIndex: number;
  confidence: number;       // 0–100
  isListening: boolean;
  aiEmotionalState: string; // "focused" | "curious" | "evaluating" | "impressed"
}

const PHASES = [
  { id: "clarification", label: "Clarify", icon: Brain },
  { id: "coding", label: "Coding", icon: Zap },
  { id: "review", label: "Review", icon: Target },
  { id: "follow_up", label: "Follow-up", icon: Sparkles },
];

const EMOTION_COLORS: Record<string, string> = {
  focused: "#00E5FF",
  curious: "#F59E0B",
  evaluating: "#8B5CF6",
  impressed: "#10B981",
};

export const InterviewMetrics = ({
  phase,
  questionIndex,
  confidence,
  isListening,
  aiEmotionalState,
}: Props) => {
  const currentPhaseIdx = PHASES.findIndex((p) => p.id === phase);
  const emotionColor = EMOTION_COLORS[aiEmotionalState] || "#00E5FF";

  // SVG arc for confidence meter
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* AI Confidence Meter */}
      <div className="relative flex items-center justify-center">
        <svg width="68" height="68" className="-rotate-90">
          {/* Track */}
          <circle
            cx="34" cy="34" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />
          {/* Progress */}
          <motion.circle
            cx="34" cy="34" r={radius}
            fill="none"
            stroke="url(#confidenceGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="confidenceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white">{confidence}</span>
          <span className="text-[7px] text-gray-500 uppercase tracking-wider">AI Conf</span>
        </div>
      </div>

      {/* Phase Tracker */}
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const isActive = i === currentPhaseIdx;
          const isPast = i < currentPhaseIdx;
          return (
            <div key={p.id} className="flex items-center gap-1">
              <motion.div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-300 ${
                  isActive
                    ? "bg-cyan-500/15 border border-cyan-500/30"
                    : isPast
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "bg-transparent border border-transparent"
                }`}
                animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Icon className={`w-3 h-3 ${
                  isActive ? "text-cyan-400" : isPast ? "text-gray-500" : "text-gray-700"
                }`} />
                <span className={`text-[9px] font-medium hidden xl:inline ${
                  isActive ? "text-cyan-300" : isPast ? "text-gray-500" : "text-gray-700"
                }`}>
                  {p.label}
                </span>
              </motion.div>
              {i < PHASES.length - 1 && (
                <div className={`w-3 h-px ${isPast ? "bg-cyan-500/30" : "bg-white/[0.06]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Question Counter */}
      <div className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
        <span className="text-[10px] font-semibold text-violet-400">
          Q{questionIndex + 1}
        </span>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <Ear className="w-3 h-3 text-red-400" />
          <span className="text-[9px] font-medium text-red-400">REC</span>
        </motion.div>
      )}

      {/* AI Emotional State */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
        style={{
          backgroundColor: `${emotionColor}10`,
          borderColor: `${emotionColor}25`,
        }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: emotionColor }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
        <span
          className="text-[9px] font-medium capitalize"
          style={{ color: emotionColor }}
        >
          {aiEmotionalState}
        </span>
      </div>
    </div>
  );
};
