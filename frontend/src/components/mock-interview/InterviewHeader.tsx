/**
 * InterviewHeader — Top bar overlay for the interview room.
 * ThinkRank logo, LIVE badge, company mode, timer, recording, exit.
 */
import { motion } from "framer-motion";
import { Bot, LogOut, Circle } from "lucide-react";
import { CompanyLogo } from "@/components/placement/CompanyLogos";

interface Props {
  companyName: string;
  companyId: string;
  elapsed: number;
  questionTitle: string;
  onExit: () => void;
}

export const InterviewHeader = ({
  companyName,
  companyId,
  elapsed,
  questionTitle,
  onExit,
}: Props) => {
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <motion.header
      className="absolute top-0 left-0 right-0 z-30 h-14 px-5 flex items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Left: Logo + LIVE + Company */}
      <div className="flex items-center gap-3">
        {/* ThinkRank Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight hidden sm:inline">
            ThinkRank
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* LIVE Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
            Live Interview
          </span>
        </div>

        {/* Company Mode */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          {companyId !== "startup" ? (
            <CompanyLogo companyId={companyId} className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3 h-3 text-emerald-400" />
          )}
          <span className="text-[10px] font-medium text-gray-400">
            {companyName}
          </span>
        </div>
      </div>

      {/* Right: Timer + Recording + Exit */}
      <div className="flex items-center gap-3">
        {/* Recording indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-control">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="text-[10px] font-medium text-gray-400">REC</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-control">
          <div className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono font-semibold text-white tabular-nums">
            {timeStr}
          </span>
        </div>

        {/* Current question */}
        <div className="hidden lg:flex items-center px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] max-w-[200px]">
          <span className="text-[10px] text-gray-500 truncate">
            {questionTitle || "Loading question..."}
          </span>
        </div>

        {/* Exit */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 group"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="text-[10px] font-medium text-red-400 group-hover:text-red-300 hidden sm:inline">
            Exit
          </span>
        </button>
      </div>
    </motion.header>
  );
};
