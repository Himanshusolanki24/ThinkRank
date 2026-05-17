import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemPanel } from "@/components/interviewos/ProblemPanel";
import { CodeEditorPanel } from "@/components/interviewos/CodeEditorPanel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
import type {
  InterviewEvaluationPayload,
  InterviewOSSessionNextResponse,
  InterviewOSSessionStartResponse,
  IntegrityTelemetryPayload,
  PublicInterviewProblem,
} from "@/features/interviewos/contracts";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Code2,
  Globe,
  Loader2,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  TimerReset,
  Trophy,
  Zap,
} from "lucide-react";

const INITIAL_INTEGRITY: IntegrityTelemetryPayload = {
  tabSwitches: 0,
  copyPasteAttempts: 0,
  hiddenWindowSeconds: 0,
  multipleFaceFrames: 0,
  gazeAwayFrames: 0,
  suspiciousIdleSeconds: 0,
  abnormalTypingBursts: 0,
  audioDeviceChanges: 0,
};

const personas = [
  {
    id: "google",
    label: "Google Interviewer",
    tone: "Calm, analytical, tradeoff-driven",
    Icon: Globe,
    activeClass: "border-blue-400/60 bg-blue-500/10 shadow-blue-500/10",
    iconClass: "text-blue-400",
    dotClass: "bg-blue-400",
  },
  {
    id: "amazon",
    label: "Amazon Interviewer",
    tone: "Direct, probing, leadership-pressure",
    Icon: Zap,
    activeClass: "border-orange-400/60 bg-orange-500/10 shadow-orange-500/10",
    iconClass: "text-orange-400",
    dotClass: "bg-orange-400",
  },
  {
    id: "startup_cto",
    label: "Startup CTO",
    tone: "Fast, skeptical, shipping-focused",
    Icon: Code2,
    activeClass: "border-emerald-400/60 bg-emerald-500/10 shadow-emerald-500/10",
    iconClass: "text-emerald-400",
    dotClass: "bg-emerald-400",
  },
  {
    id: "cp_mentor",
    label: "CP Mentor",
    tone: "Optimization-heavy, edge-case intense",
    Icon: Trophy,
    activeClass: "border-violet-400/60 bg-violet-500/10 shadow-violet-500/10",
    iconClass: "text-violet-400",
    dotClass: "bg-violet-400",
  },
] as const;

const BOOT_LINES = [
  "Initializing InterviewOS v2.4...",
  "Loading adaptive problem engine...",
  "Configuring integrity monitoring...",
  "Connecting to AI persona layer...",
  "Calibrating difficulty matrix...",
  "System ready. Good luck.",
];

const FEATURES = [
  { Icon: BrainCircuit, title: "Adaptive Difficulty", desc: "Scales with your real-time performance", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { Icon: Shield, title: "Metadata Hidden", desc: "No difficulty labels, just like real FAANG", color: "text-violet-400", bg: "bg-violet-500/10" },
  { Icon: Code2, title: "Secure IDE", desc: "Anti-cheat signals & monitored environment", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { Icon: Zap, title: "AI Persona Engine", desc: "4 distinct interviewer personalities", color: "text-orange-400", bg: "bg-orange-500/10" },
];

const BootTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= BOOT_LINES.length) {
      const t = setTimeout(() => { setLines([]); setIdx(0); }, 3500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLines((prev) => [...prev, BOOT_LINES[idx]]);
      setIdx((i) => i + 1);
    }, 650);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#08080C] font-mono text-sm p-5 min-h-[190px]">
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-gray-600 text-xs">interview-os — boot sequence</span>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.div key={`${i}-${line}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="text-gray-300">{line}</span>
          </motion.div>
        ))}
        {idx < BOOT_LINES.length && lines.length > 0 && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="inline-block w-2 h-4 bg-cyan-400 ml-6 align-middle" />
        )}
      </div>
    </div>
  );
};

const buildEvaluationFromCode = (code: string): InterviewEvaluationPayload => {
  const trimmed = code.trim();
  const lineCount = trimmed ? trimmed.split("\n").length : 0;
  const complexityHints = ["for", "while", "Map", "Set", "sort", "heap", "queue", "stack"];
  const hintHits = complexityHints.filter((hint) => code.includes(hint)).length;
  const problemSolvingScore = Math.min(10, Math.max(2, Math.round(lineCount / 3) + 2));
  const optimizationScore = Math.min(10, 3 + hintHits);
  const communicationScore = Math.min(10, /\/\/|\/\*/.test(code) ? 7 : 5);
  const debuggingScore = Math.min(10, /console\.log|print/.test(code) ? 7 : 5);
  const edgeCaseScore = Math.min(10, /if\s*\(|===|<=|>=/.test(code) ? 7 : 4);
  const confidenceScore = Math.min(10, lineCount > 8 ? 7 : 5);
  const score = Math.round((problemSolvingScore + optimizationScore + communicationScore + debuggingScore + edgeCaseScore + confidenceScore) / 6);
  return { score, problemSolvingScore, optimizationScore, communicationScore, debuggingScore, edgeCaseScore, confidenceScore };
};

const InterviewOS = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sounds = useSoundEffects();
  const [persona, setPersona] = useState<(typeof personas)[number]["id"]>("google");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [problem, setProblem] = useState<PublicInterviewProblem | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recruiterMessage, setRecruiterMessage] = useState("Let's begin. Talk through your approach before you optimize.");
  const [lastEvaluation, setLastEvaluation] = useState<{ score: number; feedback: string } | null>(null);
  const [integritySignals, setIntegritySignals] = useState<IntegrityTelemetryPayload>(INITIAL_INTEGRITY);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "review" | "unverified">("verified");
  const lastActivityRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const activePersona = personas.find((p) => p.id === persona)!;

  useEffect(() => { sounds.initAudio(); }, []);

  useEffect(() => {
    if (sessionId) {
      setElapsedSeconds(0);
      timerRef.current = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [sessionId]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    if (!sessionId) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden")
        setIntegritySignals((c) => ({ ...c, tabSwitches: c.tabSwitches + 1 }));
    };
    const handleBlur = () => setIntegritySignals((c) => ({ ...c, hiddenWindowSeconds: c.hiddenWindowSeconds + 1 }));
    const handleCopyLike = (e: ClipboardEvent) => {
      e.preventDefault();
      setRecruiterMessage("Copy and paste are blocked in this interview environment.");
      setIntegritySignals((c) => ({ ...c, copyPasteAttempts: c.copyPasteAttempts + 1 }));
    };
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < 100)
        setIntegritySignals((c) => ({ ...c, abnormalTypingBursts: c.abnormalTypingBursts + 1 }));
      lastActivityRef.current = now;
    };
    const idleTimer = window.setInterval(() => {
      const delta = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      if (delta >= 20) {
        setIntegritySignals((c) => ({ ...c, suspiciousIdleSeconds: c.suspiciousIdleSeconds + 5 }));
        lastActivityRef.current = Date.now();
      }
    }, 5000);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("copy", handleCopyLike);
    window.addEventListener("paste", handleCopyLike);
    window.addEventListener("cut", handleCopyLike);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.clearInterval(idleTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("copy", handleCopyLike);
      window.removeEventListener("paste", handleCopyLike);
      window.removeEventListener("cut", handleCopyLike);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [sessionId]);

  const startInterview = async () => {
    sounds.playClick();
    setLoading(true);
    setLoadingMessage("BOOTING INTERVIEW ORCHESTRATOR...");
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-os/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id || "anonymous", persona, preferredLang: "javascript" }),
      });
      const data = await parseApiResponse(response);
      if (!data.success) throw new Error(data.error || "Failed to start InterviewOS session.");
      const payload = data.data as InterviewOSSessionStartResponse;
      setSessionId(payload.sessionId);
      setRoundIndex(payload.roundIndex);
      setProblem(payload.publicProblem);
      setCode(payload.publicProblem.starterCode?.javascript || "");
      setIntegrityScore(payload.interviewState.integrityScore);
      setVerificationStatus(payload.interviewState.verificationStatus);
      setLastEvaluation(null);
      setIntegritySignals(INITIAL_INTEGRITY);
      sounds.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start InterviewOS.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const submitRound = async () => {
    if (!sessionId || !code.trim()) return;
    setLoading(true);
    setLoadingMessage("ANALYZING SOLUTION...");
    setError(null);
    try {
      const evaluation = buildEvaluationFromCode(code);
      const response = await fetch(`${API_BASE_URL}/api/interview-os/session/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, evaluation, integritySignals, preferredLang: "javascript" }),
      });
      const data = await parseApiResponse(response);
      if (!data.success) throw new Error(data.error || "Failed to advance the interview.");
      const payload = data.data as InterviewOSSessionNextResponse;
      setRoundIndex(payload.roundIndex);
      setProblem(payload.nextProblem);
      setCode(payload.nextProblem.starterCode?.javascript || "");
      setIntegrityScore(payload.integrity.integrityScore);
      setVerificationStatus(payload.integrity.status);
      setRecruiterMessage(payload.interviewerGuidance.pressurePrompt);
      setLastEvaluation({
        score: evaluation.score || 0,
        feedback: `Trajectory: ${payload.adaptiveDecision.trajectory}. Next difficulty remains hidden.`,
      });
      sounds.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit round.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const integrityColor = integrityScore >= 80 ? "text-emerald-400" : integrityScore >= 60 ? "text-amber-400" : "text-red-400";
  const integrityBorderBg = integrityScore >= 80 ? "border-emerald-500/30 bg-emerald-500/10" : integrityScore >= 60 ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10";
  const IntegrityIcon = integrityScore >= 80 ? ShieldCheck : integrityScore >= 60 ? Shield : ShieldAlert;

  // ── LANDING PAGE ──────────────────────────────────────────────
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[110px]" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className="container mx-auto px-4 lg:px-6 pt-14 pb-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto">

            {/* Accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-14" />

            <div className="grid lg:grid-cols-2 gap-14 items-start">
              {/* LEFT */}
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/8 px-4 py-1.5 mb-7">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-medium text-cyan-300 tracking-wide">InterviewOS Live Room</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-[3.4rem] font-bold tracking-tight leading-[1.1] mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  Adaptive
                  <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                    Interview Engine
                  </span>
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                  A hidden-metadata coding interview that starts easy and adapts like a live FAANG screening round.
                </p>

                {/* Persona grid */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Choose your interviewer</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {personas.map((p) => {
                    const active = persona === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPersona(p.id)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                          active ? `${p.activeClass} shadow-lg` : "border-white/8 bg-white/4 hover:bg-white/8"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <p.Icon className={`w-4 h-4 ${active ? p.iconClass : "text-gray-500"}`} />
                          <span className="font-semibold text-[15px] text-white">{p.label}</span>
                        </div>
                        <div className="text-sm text-gray-400 leading-snug">{p.tone}</div>
                      </button>
                    );
                  })}
                </div>

                {/* CTA */}
                <Button
                  onClick={startInterview}
                  disabled={loading}
                  className="h-14 px-8 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      Launch InterviewOS
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>
                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
                <BootTerminal />

                {/* Feature grid */}
                <div className="grid grid-cols-2 gap-3">
                  {FEATURES.map(({ Icon, title, desc, color, bg }) => (
                    <div key={title} className="rounded-2xl border border-white/8 bg-white/3 p-4 hover:bg-white/5 transition-all duration-200">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${bg} mb-3`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="font-semibold text-[14px] text-white mb-1">{title}</div>
                      <div className="text-xs text-gray-500 leading-snug">{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Stats strip */}
                <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4 flex items-center justify-between text-center">
                  {[["100+", "Problems"], ["4", "AI Personas"], ["Real-time", "Integrity"], ["Hidden", "Metadata"]].map(([val, label]) => (
                    <div key={label}>
                      <div className="text-lg font-bold text-white">{val}</div>
                      <div className="text-[11px] text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── ACTIVE SESSION ────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#1C1C1E] text-gray-100 flex flex-col overflow-hidden">
      {/* Header bar */}
      <header className="h-14 border-b border-white/8 bg-[#1C1C1E] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/interview")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </button>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-sm font-semibold text-white tracking-wide">InterviewOS</span>
          {/* Persona badge */}
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${activePersona.activeClass}`}>
            <activePersona.Icon className={`w-3 h-3 ${activePersona.iconClass}`} />
            <span className={activePersona.iconClass}>{activePersona.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Round progress */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < roundIndex ? "w-2 h-2 bg-emerald-400" : i === roundIndex ? "w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" : "w-2 h-2 bg-white/15"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">Round {roundIndex + 1}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm font-mono text-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            {formatTime(elapsedSeconds)}
          </div>

          {/* Integrity */}
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${integrityBorderBg}`}>
            <IntegrityIcon className={`w-3.5 h-3.5 ${integrityColor}`} />
            <span className={integrityColor}>{integrityScore}</span>
          </div>
        </div>
      </header>

      {/* Action bar */}
      <div className="h-12 border-b border-white/8 bg-[#161618] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-4 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg">
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run
          </Button>
          <Button
            onClick={submitRound}
            disabled={loading || !code.trim()}
            size="sm"
            className="h-8 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-semibold"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            {loading ? loadingMessage || "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Recruiter message */}
        <div className="flex-1 mx-6 text-xs text-gray-500 italic truncate text-center hidden md:block">
          {recruiterMessage}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Siren className="w-3.5 h-3.5 text-amber-400" />
            Switches: {integritySignals.tabSwitches}
          </span>
          <span className="flex items-center gap-1">
            <TimerReset className="w-3.5 h-3.5 text-cyan-400" />
            Idle: {integritySignals.suspiciousIdleSeconds}s
          </span>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-400 text-[10px]">
            {verificationStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main split panel */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full rounded-2xl overflow-hidden border border-white/8">
          <ResizablePanelGroup direction="horizontal" className="h-full bg-[#252527]">
            <ResizablePanel defaultSize={50} minSize={30}>
              <ProblemPanel problem={problem} roundIndex={roundIndex} personaLabel={activePersona.label} />
            </ResizablePanel>
            <ResizableHandle className="bg-white/8 w-[3px] hover:bg-cyan-500/40 transition-colors" />
            <ResizablePanel defaultSize={50} minSize={30}>
              <CodeEditorPanel
                code={code}
                setCode={setCode}
                isLoading={loading}
                onType={sounds.playTyping}
                lastEvaluation={lastEvaluation}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default InterviewOS;
