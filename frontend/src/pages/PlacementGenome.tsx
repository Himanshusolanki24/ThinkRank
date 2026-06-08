/**
 * PlacementGenome Page
 * 
 * AI-powered placement intelligence dashboard combining:
 * - Overall readiness scoring
 * - Company targeting with readiness cards
 * - Company-specific strategy panels
 * - Adaptive AI roadmap
 * - Daily task engine
 * - Peer benchmarking
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dna, Sparkles, ArrowRight, BarChart3, Rocket, Brain,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { ReadinessOverview } from "@/components/placement/ReadinessOverview";
import { CompanyReadinessCard } from "@/components/placement/CompanyReadinessCard";
import { CompanyDetailPanel } from "@/components/placement/CompanyDetailPanel";
import { RoadmapTimeline } from "@/components/placement/RoadmapTimeline";
import { DailyTaskEngine } from "@/components/placement/DailyTaskEngine";
import { PeerBenchmarkPanel } from "@/components/placement/PeerBenchmarkPanel";

import {
  COMPANY_PROFILES,
  MOCK_USER_READINESS,
  MOCK_DAILY_TASKS,
  MOCK_PEER_BENCHMARKS,
  MOCK_ROADMAP,
} from "@/data/placementGenomeData";

type TabKey = "targeting" | "roadmap" | "tasks" | "benchmark";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "targeting", label: "Company Targeting", icon: Rocket },
  { key: "roadmap", label: "AI Roadmap", icon: Brain },
  { key: "tasks", label: "Daily Tasks", icon: BarChart3 },
  { key: "benchmark", label: "Peer Benchmark", icon: BarChart3 },
];

export default function PlacementGenome() {
  const [activeTab, setActiveTab] = useState<TabKey>("targeting");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const selectedCompany = selectedCompanyId
    ? COMPANY_PROFILES.find((c) => c.id === selectedCompanyId)
    : null;

  const selectedScore = selectedCompanyId
    ? MOCK_USER_READINESS.companyScores.find((s) => s.companyId === selectedCompanyId)
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-16">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/[0.04] rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <Dna className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs text-violet-300 font-medium">Placement Genome Intelligence</span>
                <Sparkles className="w-3 h-3 text-violet-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-white">Placement </span>
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Genome
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-xl">
                AI-powered placement acceleration — company targeting, adaptive roadmaps,
                readiness scoring, and intelligent daily preparation.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3">
              {[
                { label: "Overall", value: `${MOCK_USER_READINESS.overall}%`, color: "#8B5CF6" },
                { label: "Companies", value: COMPANY_PROFILES.length.toString(), color: "#06B6D4" },
                { label: "Tasks Today", value: MOCK_DAILY_TASKS.filter((t) => !t.isCompleted).length.toString(), color: "#10B981" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Readiness Overview */}
        <div className="mb-8">
          <ReadinessOverview readiness={MOCK_USER_READINESS} />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key !== "targeting") setSelectedCompanyId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "targeting" && (
            <motion.div
              key="targeting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Company Grid */}
                <div className={`flex-1 ${selectedCompany ? "lg:w-[55%]" : "w-full"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-300">Target Companies</h2>
                    <Badge className="bg-white/[0.05] text-gray-400 border-white/[0.08] text-[10px]">
                      {COMPANY_PROFILES.length} companies analyzed
                    </Badge>
                  </div>
                  <div className={`grid gap-4 ${selectedCompany ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                    {MOCK_USER_READINESS.companyScores.map((score, idx) => {
                      const company = COMPANY_PROFILES.find((c) => c.id === score.companyId);
                      if (!company) return null;
                      return (
                        <CompanyReadinessCard
                          key={score.companyId}
                          score={score}
                          company={company}
                          index={idx}
                          onSelect={setSelectedCompanyId}
                          isSelected={selectedCompanyId === score.companyId}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Company Detail Panel */}
                <AnimatePresence>
                  {selectedCompany && selectedScore && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="lg:w-[45%] lg:max-w-[480px]"
                    >
                      <CompanyDetailPanel
                        company={selectedCompany}
                        score={selectedScore}
                        onClose={() => setSelectedCompanyId(null)}
                        onGenerateRoadmap={() => {
                          setActiveTab("roadmap");
                          setSelectedCompanyId(null);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === "roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RoadmapTimeline roadmap={MOCK_ROADMAP} />
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DailyTaskEngine tasks={MOCK_DAILY_TASKS} />
            </motion.div>
          )}

          {activeTab === "benchmark" && (
            <motion.div
              key="benchmark"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PeerBenchmarkPanel benchmarks={MOCK_PEER_BENCHMARKS} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
