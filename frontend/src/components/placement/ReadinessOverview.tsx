/**
 * ReadinessOverview — Hero section with overall placement readiness scores
 */
import { motion } from "framer-motion";
import { Shield, Zap, Target, TrendingUp, Sparkles } from "lucide-react";
import type { PlacementReadiness } from "@/data/placementGenomeData";

interface Props {
  readiness: PlacementReadiness;
}

const MetricRing = ({ value, label, color, delay, icon: Icon }: { value: number; label: string; color: string; delay: number; icon: React.ElementType }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <motion.circle
            cx="44" cy="44" r="40" fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-lg font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
    </motion.div>
  );
};

export const ReadinessOverview = ({ readiness }: Props) => {
  const metrics = [
    { value: readiness.technical, label: "Technical\nReadiness", color: "#8B5CF6", icon: Zap },
    { value: readiness.interview, label: "Interview\nReadiness", color: "#06B6D4", icon: Target },
    { value: readiness.consistency, label: "Coding\nConsistency", color: "#10B981", icon: TrendingUp },
    { value: readiness.recruiterAttractiveness, label: "Recruiter\nAttractiveness", color: "#F59E0B", icon: Sparkles },
  ];

  const overallCircumference = 2 * Math.PI * 54;
  const overallOffset = overallCircumference - (readiness.overall / 100) * overallCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111118] to-[#0A0A10] p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">Placement Readiness Index</h2>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Big overall ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative shrink-0"
        >
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke="url(#overallGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={overallCircumference}
                initial={{ strokeDashoffset: overallCircumference }}
                animate={{ strokeDashoffset: overallOffset }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{readiness.overall}%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Overall</span>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-2xl -z-10" />
        </motion.div>

        {/* Sub-metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
          {metrics.map((m, i) => (
            <MetricRing key={m.label} {...m} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
