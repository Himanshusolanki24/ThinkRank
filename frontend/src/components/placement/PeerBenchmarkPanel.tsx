/**
 * PeerBenchmarkPanel — Percentile rankings and peer comparison analytics
 */
import { motion } from "framer-motion";
import { Users, TrendingUp, ArrowUpRight } from "lucide-react";
import type { PeerBenchmark } from "@/data/placementGenomeData";

interface Props {
  benchmarks: PeerBenchmark[];
}

const getPercentileColor = (p: number) => {
  if (p >= 80) return "#10B981";
  if (p >= 60) return "#F59E0B";
  if (p >= 40) return "#F97316";
  return "#EF4444";
};

export const PeerBenchmarkPanel = ({ benchmarks }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111118] to-[#0A0A10] p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">Peer Benchmarking</h2>
      </div>

      <div className="space-y-4">
        {benchmarks.map((bm, i) => {
          const color = getPercentileColor(bm.percentile);
          return (
            <motion.div
              key={bm.metric}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{bm.metric}</span>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}15`, color }}
                >
                  Top {100 - bm.percentile}%
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bm.percentile}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
                {/* Top candidate marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/40 rounded-full"
                  style={{ left: `${Math.min((bm.topCandidateAvg / (bm.topCandidateAvg * 1.3)) * 100, 95)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-gray-400">
                    You: <span className="text-white font-medium">{bm.userValue}</span>
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">
                    Top candidates: <span className="text-cyan-300 font-medium">{bm.topCandidateAvg}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 mt-2 text-[11px] text-gray-500">
                <ArrowUpRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                <span>{bm.recommendation}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
