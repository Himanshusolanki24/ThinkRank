/**
 * AIVideoPanel — Left 65% of the interview room.
 * Cinematic AI avatar scene with animated orb, floating particles,
 * gradient mesh background, and interview metrics.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { AIOrb, type OrbState } from "./AIOrb";
import { InterviewMetrics } from "./InterviewMetrics";
import { FloatingControls } from "./FloatingControls";
import { InterviewHeader } from "./InterviewHeader";

interface Props {
  // Interview state
  companyName: string;
  companyId: string;
  elapsed: number;
  phase: string;
  questionIndex: number;
  questionTitle: string;
  isAiThinking: boolean;
  isAiSpeaking: boolean;
  voiceStatus?: "idle" | "loading" | "speaking" | "paused" | "error";

  // Controls
  micOn: boolean;
  camOn: boolean;
  codeMode: boolean;
  isFullscreen: boolean;
  audioStream: MediaStream | null;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleCodeMode: () => void;
  onToggleFullscreen: () => void;
  onScreenShare: () => void;
  onAiAssist: () => void;
  onEndInterview: () => void;
  onExit: () => void;
}

// Generate random floating particles for background atmosphere
const generateBgParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 5,
    opacity: 0.1 + Math.random() * 0.25,
  }));

export const AIVideoPanel = ({
  companyName, companyId, elapsed, phase, questionIndex, questionTitle,
  isAiThinking, isAiSpeaking, voiceStatus = "idle",
  micOn, camOn, codeMode, isFullscreen, audioStream,
  onToggleMic, onToggleCam, onToggleCodeMode, onToggleFullscreen,
  onScreenShare, onAiAssist, onEndInterview, onExit,
}: Props) => {
  const bgParticles = useMemo(() => generateBgParticles(20), []);

  // Derive orb state
  const orbState: OrbState = isAiThinking
    ? "thinking"
    : isAiSpeaking
    ? "speaking"
    : phase === "review"
    ? "reviewing"
    : "listening";

  // AI confidence simulation (would be from API in production)
  const confidence = useMemo(() => {
    const base = 65;
    const phaseBonus = phase === "review" ? 15 : phase === "coding" ? 10 : 5;
    return Math.min(100, base + phaseBonus + Math.floor(Math.random() * 10));
  }, [phase]);

  // AI emotional state derived from phase
  const aiEmotionalState = useMemo(() => {
    if (isAiThinking) return "evaluating";
    if (phase === "review") return "impressed";
    if (phase === "coding") return "focused";
    return "curious";
  }, [phase, isAiThinking]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050507] text-white">
      {/* ── Background Layers ────────────────────────────── */}

      {/* Animated gradient mesh */}
      <div
        className="absolute inset-0 animate-gradient-mesh opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(0, 229, 255, 0.08) 0%, transparent 45%), " +
            "radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 45%), " +
            "radial-gradient(ellipse at 50% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 45%)",
        }}
      />

      {/* Blurred neon blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[160px]"
        style={{ background: "rgba(0, 229, 255, 0.05)", top: "10%", left: "15%" }}
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[140px]"
        style={{ background: "rgba(139, 92, 246, 0.04)", bottom: "15%", right: "20%" }}
        animate={{ x: [0, -20, 25, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating particles */}
      {bgParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, -15, -40, 0],
            x: [0, 10, -8, 5, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity * 0.5, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Header ───────────────────────────────────────── */}
      <InterviewHeader
        companyName={companyName}
        companyId={companyId}
        elapsed={elapsed}
        questionTitle={questionTitle}
        onExit={onExit}
      />

      {/* ── Center: AI Orb ───────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <AIOrb state={orbState} size={140} />
        </motion.div>
      </div>

      <motion.div
        className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full glass-control border border-white/[0.06] shadow-sm"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Voice:{" "}
          <span className={
            voiceStatus === "speaking"
              ? "text-cyan-300"
              : voiceStatus === "loading"
              ? "text-amber-300"
              : voiceStatus === "error"
              ? "text-red-300"
              : "text-gray-500"
          }>
            {voiceStatus === "loading" ? "generating" : voiceStatus}
          </span>
        </span>
      </motion.div>

      {/* ── Bottom metrics bar ───────────────────────────── */}
      <motion.div
        className="absolute bottom-24 left-0 right-0 flex justify-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="px-4 py-2 rounded-3xl glass-control border border-white/[0.08] shadow-lg shadow-cyan-500/5">
          <InterviewMetrics
            phase={phase}
            questionIndex={questionIndex}
            confidence={confidence}
            isListening={micOn}
            aiEmotionalState={aiEmotionalState}
          />
        </div>
      </motion.div>

      {/* ── Floating Controls ────────────────────────────── */}
      <FloatingControls
        micOn={micOn}
        camOn={camOn}
        codeMode={codeMode}
        isFullscreen={isFullscreen}
        audioStream={audioStream}
        onToggleMic={onToggleMic}
        onToggleCam={onToggleCam}
        onToggleCodeMode={onToggleCodeMode}
        onToggleFullscreen={onToggleFullscreen}
        onScreenShare={onScreenShare}
        onAiAssist={onAiAssist}
        onEndInterview={onEndInterview}
      />

      {/* ── Cinematic vignette ───────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,5,7,0.6) 100%)",
        }}
      />
    </div>
  );
};
