/**
 * CompanyReadinessCard — Shows readiness score, probability, and skills for a target company.
 */
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/placement/CompanyLogos";
import type { CompanyReadinessScore, CompanyProfile } from "@/data/placementGenomeData";

interface Props {
  score: CompanyReadinessScore;
  company: CompanyProfile;
  index: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const CompanyReadinessCard = ({ score, company, index, onSelect, isSelected }: Props) => {
  const readinessColor =
    score.readiness >= 80 ? "#10B981" :
    score.readiness >= 60 ? "#F59E0B" :
    "#EF4444";

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score.readiness / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => onSelect(company.id)}
      className={`relative group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
        isSelected
          ? "border-violet-500/50 bg-violet-500/5 scale-[1.02]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
      style={{
        boxShadow: isSelected ? `0 0 30px ${company.glowColor}` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: `${company.accentColor}15` }}
          >
            <CompanyLogo companyId={company.id} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{company.name}</h3>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">{company.tier.replace("_", " ")}</span>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <motion.circle
              cx="40" cy="40" r="36" fill="none"
              stroke={readinessColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold" style={{ color: readinessColor }}>{score.readiness}%</span>
          </div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500">Selection Probability</span>
          <span className="text-gray-300 font-medium">{score.probability}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${company.accentColor}, ${readinessColor})` }}
            initial={{ width: 0 }}
            animate={{ width: `${score.probability}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        </div>
      </div>

      {/* Weekly delta */}
      <div className="flex items-center gap-1.5 mb-3">
        {score.weeklyDelta > 0 ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className={`text-xs font-medium ${score.weeklyDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
          {score.weeklyDelta > 0 ? "+" : ""}{score.weeklyDelta}% this week
        </span>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        {score.missingSkills.slice(0, 2).map((skill) => (
          <div key={skill} className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-gray-400 truncate">{skill}</span>
          </div>
        ))}
        {score.strengths.slice(0, 1).map((s) => (
          <div key={s} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-gray-400 truncate">{s}</span>
          </div>
        ))}
      </div>

      {/* Expand indicator */}
      <div className="flex items-center justify-end mt-3 text-xs text-gray-600 group-hover:text-violet-400 transition-colors">
        <span>View Strategy</span>
        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </motion.div>
  );
};
