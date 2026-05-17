/**
 * CompanyDetailPanel — Expanded strategy view for a selected company
 */
import { motion } from "framer-motion";
import {
  X, BookOpen, Brain, Target, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, Zap, BarChart3, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CompanyProfile, CompanyReadinessScore } from "@/data/placementGenomeData";

interface Props {
  company: CompanyProfile;
  score: CompanyReadinessScore;
  onClose: () => void;
}

const ROUND_COLORS: Record<string, string> = {
  coding: "#8B5CF6",
  system_design: "#06B6D4",
  behavioral: "#F59E0B",
  oa: "#10B981",
  machine_coding: "#EC4899",
  domain: "#6366F1",
};

export const CompanyDetailPanel = ({ company, score, onClose }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12121a] to-[#0A0A10] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: `${company.accentColor}15`, color: company.accentColor }}
          >
            {company.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{company.name}</h2>
            <p className="text-xs text-gray-500">Placement Strategy & Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Readiness + Probability */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Readiness</div>
          <div className="text-2xl font-bold" style={{ color: score.readiness >= 70 ? "#10B981" : "#F59E0B" }}>
            {score.readiness}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-400">+{score.weeklyDelta}% /week</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Selection Probability</div>
          <div className="text-2xl font-bold" style={{ color: score.probability >= 50 ? "#06B6D4" : "#F97316" }}>
            {score.probability}%
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {company.avgSalary.currency === "USD" ? "$" : "₹"}{(company.avgSalary.min / 1000).toFixed(0)}k – {(company.avgSalary.max / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Interview Process */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Interview Process</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{company.interviewRounds.length} rounds</span>
        </div>
        <div className="space-y-2">
          {company.interviewRounds.map((round, idx) => {
            const color = ROUND_COLORS[round.type] || "#8B5CF6";
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white">{round.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {round.focusAreas.slice(0, 3).map((f) => (
                      <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-500">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px] text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {round.duration}m
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    {round.difficulty}/10
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Skill Gaps</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {score.missingSkills.map((s) => (
            <Badge key={s} className="bg-red-500/10 text-red-300 border-red-500/20 text-[10px]">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Your Strengths</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {score.strengths.map((s) => (
            <Badge key={s} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Prep Priorities */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Preparation Priorities</h3>
        </div>
        <div className="space-y-1.5">
          {company.preparationPriorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-violet-500/10 text-violet-300 shrink-0">
                {i + 1}
              </span>
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Top Interview Topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Hot Interview Topics</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {company.topTopics.map((t) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/10">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 font-medium"
      >
        Generate {company.name} Roadmap
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
};
