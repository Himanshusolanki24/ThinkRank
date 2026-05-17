/**
 * RoadmapTimeline — Adaptive 4-month placement preparation roadmap
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Calendar, Clock, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase } from "@/data/placementGenomeData";

interface Props {
  roadmap: RoadmapPhase[];
}

const MONTH_COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981"];

export const RoadmapTimeline = ({ roadmap }: Props) => {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111118] to-[#0A0A10] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">AI Placement Roadmap</h2>
        </div>
        <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs">4-Month Plan</Badge>
      </div>

      <div className="space-y-3">
        {roadmap.map((phase, idx) => {
          const isExpanded = expandedMonth === idx;
          const color = MONTH_COLORS[idx];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpandedMonth(isExpanded ? null : idx)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  isExpanded
                    ? "border-white/[0.1] bg-white/[0.03]"
                    : "border-transparent hover:bg-white/[0.02]"
                }`}
              >
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${color}20`, color }}
                  >
                    M{phase.month}
                  </div>
                  {idx < roadmap.length - 1 && (
                    <div className="w-px h-4 mt-1" style={{ background: `${color}30` }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{phase.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {phase.focus.slice(0, 4).map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {phase.dailyHours}h/day
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-16 pr-4 pb-4 space-y-4">
                      {/* Milestones */}
                      <div className="flex flex-wrap gap-2">
                        {phase.milestones.map((m) => (
                          <Badge key={m} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">
                            🎯 {m}
                          </Badge>
                        ))}
                      </div>

                      {/* Weekly breakdown */}
                      <div className="grid gap-3">
                        {phase.weeklyGoals.map((wg) => (
                          <div
                            key={wg.week}
                            className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.01]"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-3 h-3" style={{ color }} />
                              <span className="text-xs font-medium text-white">Week {wg.week}</span>
                              <span className="text-[10px] text-gray-500 ml-auto">{wg.target}</span>
                            </div>
                            <div className="space-y-1">
                              {wg.tasks.map((t, ti) => (
                                <div key={ti} className="flex items-center gap-2 text-xs text-gray-400">
                                  <Circle className="w-2.5 h-2.5 shrink-0" style={{ color: `${color}80` }} />
                                  {t}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
