/**
 * MockInterview — Main Interview Room Page
 * Cinematic fullscreen split-screen: AI Video Experience (left 65%) + Live Transcript (right 35%)
 * Features: AI Orb, floating controls, glassmorphic transcript, code editor toggle
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SiPython, SiJavascript, SiCplusplus } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import {
  ArrowRight, Loader2, Shield, Brain, Zap, Target, Bot, Rocket,
  Sparkles, Star, ChevronRight, Code2, Clock, Users, Video, VideoOff, Mic, MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/placement/CompanyLogos";
import { useAuth } from "@/contexts/AuthContext";
import { mockInterviewAPI } from "@/services/mockInterviewAPI";
import { AIVideoPanel } from "@/components/mock-interview/AIVideoPanel";
import { LiveTranscriptPanel } from "@/components/mock-interview/LiveTranscriptPanel";
import { CodeEditorPanel } from "@/components/mock-interview/CodeEditorPanel";
import { VoiceWaveform } from "@/components/mock-interview/VoiceWaveform";
import { useInterviewerVoice } from "@/hooks/useInterviewerVoice";
import type {
  InterviewQuestion, AIPersona, ConversationMessage, InterviewReport,
} from "@/services/mockInterviewAPI";

// ── TYPES ────────────────────────────────────────────────────
type Screen = "lobby" | "permissions" | "room" | "report";

interface SessionConfig {
  companyStyle: string;
  difficulty: string;
  language: string;
}

// ── PERSONAS CONFIG ──────────────────────────────────────────
const COMPANY_STYLES = [
  { id: "google", label: "Google", color: "#4285F4", desc: "Structured, scalability focus" },
  { id: "amazon", label: "Amazon", color: "#FF9900", desc: "Practical, edge-case driven" },
  { id: "microsoft", label: "Microsoft", color: "#00BCF2", desc: "Collaborative, pair-programming" },
  { id: "meta", label: "Meta", color: "#0668E1", desc: "Fast-paced, optimal solutions" },
  { id: "startup", label: "Startup", color: "#10B981", desc: "Casual, ship-focused" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "#10B981" },
  { id: "medium", label: "Medium", color: "#F59E0B" },
  { id: "hard", label: "Hard", color: "#EF4444" },
  { id: "faang", label: "FAANG", color: "#8B5CF6" },
];

const LANGUAGES_OPT = [
  { id: "python", label: "Python", Icon: SiPython, iconClassName: "text-[#3776AB]" },
  { id: "javascript", label: "JavaScript", Icon: SiJavascript, iconClassName: "text-[#F7DF1E]" },
  { id: "java", label: "Java", Icon: FaJava, iconClassName: "text-[#ED8B00]" },
  { id: "cpp", label: "C++", Icon: SiCplusplus, iconClassName: "text-[#00599C]" },
];

const CompanyStyleLogo = ({ companyId, color }: { companyId: string; color: string }) => {
  if (companyId === "startup") {
    return <Rocket className="w-4 h-4" style={{ color }} />;
  }

  return <CompanyLogo companyId={companyId} className="w-4 h-4" />;
};

// ── LOBBY FEATURES ────────────────────────────────────────────
const LOBBY_FEATURES = [
  { icon: Shield, label: "Integrity", desc: "Tab tracking", color: "#00E5FF" },
  { icon: Brain, label: "AI Review", desc: "Code analysis", color: "#8B5CF6" },
  { icon: Zap, label: "Real-time", desc: "Live feedback", color: "#10B981" },
  { icon: Target, label: "Analytics", desc: "Full report", color: "#F59E0B" },
];

// ── LOCAL VIDEO PREVIEW ──────────────────────────────────────
const LocalVideoPreview = ({ stream, camOn }: { stream: MediaStream | null; camOn: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && camOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camOn]);

  if (!camOn || !stream) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-6 text-center">
        <VideoOff className="w-10 h-10 text-gray-500 mb-3" />
        <p className="text-xs text-gray-400">Camera is disabled or access not granted.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#050507]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] text-gray-300 border border-white/5">
        Live Feed
      </div>
    </div>
  );
};

// ── FLOATING WEBCAM ──────────────────────────────────────────
interface FloatingWebcamProps {
  stream: MediaStream | null;
  camOn: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

const FloatingWebcam = ({ stream, camOn, containerRef }: FloatingWebcamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && camOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camOn]);

  if (!camOn || !stream) return null;

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.05}
      dragMomentum={false}
      whileHover={{ scale: 1.03 }}
      className="absolute bottom-6 right-6 z-40 w-48 h-32 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d12]/95 shadow-2xl cursor-grab active:cursor-grabbing hover:border-cyan-500/30 transition-colors"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] text-gray-300 border border-white/5 select-none">
        You
      </div>
    </motion.div>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────
const MockInterview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Screen state
  const [screen, setScreen] = useState<Screen>("lobby");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config
  const [config, setConfig] = useState<SessionConfig>({
    companyStyle: "google",
    difficulty: "medium",
    language: "python",
  });

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [persona, setPersona] = useState<AIPersona | null>(null);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("clarification");
  const [elapsed, setElapsed] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const interviewerVoice = useInterviewerVoice();
  const isAiSpeaking = interviewerVoice.status === "speaking";

  const triggerSpeaking = useCallback((text: string) => {
    interviewerVoice.speak(text, { persona: config.companyStyle, sessionId });
  }, [config.companyStyle, interviewerVoice, sessionId]);

  const stopSpeaking = useCallback(() => {
    interviewerVoice.stop();
  }, [interviewerVoice]);

  // Code state
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [codeReview, setCodeReview] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState("");

  // UI state
  const [codeMode, setCodeMode] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Active streams ref for unmount cleanup
  const streamsRef = useRef<{ audio: MediaStream | null; video: MediaStream | null }>({ audio: null, video: null });

  useEffect(() => {
    streamsRef.current = { audio: audioStream, video: videoStream };
  }, [audioStream, videoStream]);

  useEffect(() => {
    return () => {
      streamsRef.current.audio?.getTracks().forEach((t) => t.stop());
      streamsRef.current.video?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Report
  const [report, setReport] = useState<InterviewReport | null>(null);

  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (screen === "room" && sessionId) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, sessionId]);

  // Tab switch detection
  useEffect(() => {
    if (!sessionId) return;
    const handler = () => {
      if (document.hidden) {
        mockInterviewAPI.reportIntegrity(sessionId, "tab_switch").catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [sessionId]);

  // ── MIC TOGGLE ──────────────────────────────────────────
  const handleToggleMic = useCallback(async () => {
    if (micOn) {
      audioStream?.getTracks().forEach((t) => t.stop());
      setAudioStream(null);
      setMicOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setMicOn(true);
      } catch {
        console.warn("Microphone access denied");
      }
    }
  }, [micOn, audioStream]);

  // ── CAMERA TOGGLE ────────────────────────────────────────
  const handleToggleCam = useCallback(async () => {
    if (camOn) {
      videoStream?.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
      setCamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        setCamOn(true);
      } catch {
        console.warn("Camera access denied");
      }
    }
  }, [camOn, videoStream]);

  // Auto-request camera and mic permissions on entering the permissions setup screen
  useEffect(() => {
    if (screen === "permissions") {
      const autoRequest = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          setAudioStream(stream);
          setVideoStream(stream);
          setCamOn(true);
          setMicOn(true);
        } catch {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(vStream);
            setCamOn(true);
          } catch {}
          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(aStream);
            setMicOn(true);
          } catch {}
        }
      };
      autoRequest();
    }
  }, [screen]);

  // ── FULLSCREEN TOGGLE ───────────────────────────────────
  const handleToggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // ── START INTERVIEW ──────────────────────────────────────
  const startInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockInterviewAPI.startSession({
        userId: user?.id,
        companyStyle: config.companyStyle,
        difficulty: config.difficulty,
        language: config.language,
      });

      setSessionId(data.sessionId);
      setPersona(data.persona);
      setQuestion(data.question);
      setConversations(data.conversations || []);
      setLanguage(config.language);
      setCode("");
      setScreen("room");

      if (data.conversations && data.conversations.length > 0) {
        const lastAiMsg = [...data.conversations].reverse().find(m => m.role === "ai");
        if (lastAiMsg) {
          triggerSpeaking(lastAiMsg.content);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── AI MESSAGE ───────────────────────────────────────────
  const handleSendMessage = useCallback(async (message: string) => {
    if (!sessionId) return;
    setConversations((prev) => [...prev, { role: "user", content: message, type: "text", timestamp: elapsed * 1000 }]);
    stopSpeaking();
    setIsAiThinking(true);
    try {
      const data = await mockInterviewAPI.sendMessage(sessionId, message, code);
      setConversations((prev) => [...prev, { role: "ai", content: data.response, type: "text", timestamp: data.elapsed * 1000 }]);
      if (data.phase) setPhase(data.phase);
      triggerSpeaking(data.response);
    } catch (err: any) {
      const errMsg = "I had a brief connection issue. Could you repeat that?";
      setConversations((prev) => [...prev, { role: "ai", content: errMsg, type: "text", timestamp: elapsed * 1000 }]);
      triggerSpeaking(errMsg);
    } finally {
      setIsAiThinking(false);
    }
  }, [sessionId, code, elapsed, triggerSpeaking, stopSpeaking]);

  // ── RUN CODE ─────────────────────────────────────────────
  const handleRunCode = useCallback(async (customInput?: string) => {
    if (!sessionId) return;
    setIsRunning(true);
    setConsoleOutput("Running...");
    try {
      const data = await mockInterviewAPI.runCode(sessionId, code, language, customInput);
      if (data.type === "test") {
        setTestResults(data.results);
        setConsoleOutput(`${data.passed_count}/${data.total_count} test cases passed`);
      } else {
        setConsoleOutput(data.result?.stdout || data.result?.stderr || data.result?.compile_output || "No output");
      }
    } catch (err: any) {
      setConsoleOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [sessionId, code, language]);

  // ── SUBMIT CODE ──────────────────────────────────────────
  const handleSubmitCode = useCallback(async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    stopSpeaking();
    setIsAiThinking(true);
    try {
      const data = await mockInterviewAPI.submitCode(sessionId, code, language);
      setTestResults(data.testResults?.results || []);
      setCodeReview(data.review);
      setConsoleOutput(
        `Submission: ${data.submission.status}\n` +
        `Passed: ${data.submission.passedCount}/${data.submission.totalCount}\n` +
        `Hidden cases tested: ${data.submission.hiddenCasesTested}`
      );
      if (data.interviewerComment) {
        setConversations((prev) => [...prev, { role: "ai", content: data.interviewerComment, type: "code_review", timestamp: elapsed * 1000 }]);
        triggerSpeaking(data.interviewerComment);
      }
      setPhase("review");
    } catch (err: any) {
      setConsoleOutput(`Submit error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsAiThinking(false);
    }
  }, [sessionId, code, language, elapsed, triggerSpeaking, stopSpeaking]);

  // ── HINT ─────────────────────────────────────────────────
  const handleRequestHint = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await mockInterviewAPI.getHint(sessionId);
      const hintMsg = `💡 Hint ${data.hintNumber}/${data.totalHints}: ${data.hint}`;
      setConversations((prev) => [...prev, { role: "ai", content: hintMsg, type: "hint", timestamp: elapsed * 1000 }]);
      triggerSpeaking(hintMsg);
    } catch {}
  }, [sessionId, elapsed, triggerSpeaking]);

  // ── NEXT QUESTION ────────────────────────────────────────
  const handleNextQuestion = useCallback(async () => {
    if (!sessionId) return;
    stopSpeaking();
    setIsAiThinking(true);
    try {
      const data = await mockInterviewAPI.nextQuestion(sessionId);
      setQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setCode("");
      setTestResults(null);
      setCodeReview(null);
      setConsoleOutput("");
      setPhase("clarification");
      if (data.aiMessage) {
        setConversations((prev) => [...prev, { role: "ai", content: data.aiMessage, type: "question", timestamp: elapsed * 1000 }]);
        triggerSpeaking(data.aiMessage);
      }
    } catch {}
    setIsAiThinking(false);
  }, [sessionId, elapsed, triggerSpeaking, stopSpeaking]);

  // ── END INTERVIEW ────────────────────────────────────────
  const handleEndInterview = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    stopSpeaking();
    try {
      const data = await mockInterviewAPI.endSession(sessionId);
      setReport(data.report);
      setScreen("report");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, stopSpeaking]);

  // ══════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ══════════════════════════════════════════════════════════
  if (screen === "lobby") {
    return (
      <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
        {/* ── Background ──────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute inset-0 animate-gradient-mesh opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at 25% 30%, rgba(0, 229, 255, 0.06) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 75% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 50% 90%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)",
            }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
            style={{ background: "rgba(0, 229, 255, 0.04)", top: "-10%", left: "20%" }}
            animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: "rgba(139, 92, 246, 0.035)", bottom: "-5%", right: "15%" }}
            animate={{ x: [0, -30, 35, 0], y: [0, 25, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* ── Content ─────────────────────────────── */}
        <div className="container mx-auto px-4 lg:px-6 pt-14 pb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto"
          >
            {/* Top gradient line */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-14" />

            {/* Header */}
            <div className="text-center mb-14">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.05] px-5 py-2 mb-7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="text-xs font-medium text-cyan-300 tracking-wide">AI Mock Interview Platform</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5 font-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Real Interview
                <span className="block mt-1">
                  <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                    Experience
                  </span>
                </span>
              </motion.h1>

              <motion.p
                className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Practice with AI interviewers that mimic Google, Amazon, Microsoft, and more.
                Full coding environment with real-time AI feedback.
              </motion.p>
            </div>

            {/* Config Grid */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {/* Company Style */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Interviewer Style</p>
                <div className="space-y-2">
                  {COMPANY_STYLES.map((c) => (
                    <motion.button
                      key={c.id}
                      onClick={() => setConfig({ ...config, companyStyle: c.id })}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                        config.companyStyle === c.id
                          ? "border-white/15 bg-white/[0.06] shadow-lg shadow-black/20"
                          : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: `${c.color}18` }}>
                        <CompanyStyleLogo companyId={c.id} color={c.color} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium text-white">{c.label}</p>
                        <p className="text-[10px] text-gray-500">{c.desc}</p>
                      </div>
                      {config.companyStyle === c.id && (
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color, boxShadow: `0 0 8px ${c.color}60` }}
                          layoutId="company-indicator"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Difficulty + Language */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Difficulty</p>
                <div className="space-y-2">
                  {DIFFICULTIES.map((d) => (
                    <motion.button
                      key={d.id}
                      onClick={() => setConfig({ ...config, difficulty: d.id })}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                        config.difficulty === d.id
                          ? "border-white/15 bg-white/[0.06] shadow-lg shadow-black/20"
                          : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className="w-3 h-3 rounded-full transition-all"
                        style={{
                          backgroundColor: d.color,
                          boxShadow: config.difficulty === d.id ? `0 0 10px ${d.color}50` : "none",
                        }}
                      />
                      <span className="text-sm font-medium text-white">{d.label}</span>
                    </motion.button>
                  ))}
                </div>

                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 mt-7">Language</p>
                <div className="space-y-2">
                  {LANGUAGES_OPT.map((l) => (
                    <motion.button
                      key={l.id}
                      onClick={() => setConfig({ ...config, language: l.id })}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                        config.language === l.id
                          ? "border-white/15 bg-white/[0.06] shadow-lg shadow-black/20"
                          : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <l.Icon className={`w-5 h-5 ${l.iconClassName}`} />
                      <span className="text-sm font-medium text-white">{l.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preview + CTA */}
              <div className="flex flex-col">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4 flex-1 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Session Preview
                  </h3>
                  <div className="space-y-3.5">
                    {[
                      { label: "Interviewer", value: COMPANY_STYLES.find((c) => c.id === config.companyStyle)?.label },
                      { label: "Difficulty", value: DIFFICULTIES.find((d) => d.id === config.difficulty)?.label },
                      { label: "Language", value: LANGUAGES_OPT.find((l) => l.id === config.language)?.label },
                      { label: "Duration", value: "~45 min" },
                      { label: "Questions", value: "2-3 problems" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {LOBBY_FEATURES.map(({ icon: Icon, label, desc, color }) => (
                    <motion.div
                      key={label}
                      className="p-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] text-center group hover:bg-white/[0.04] transition-all duration-300"
                      whileHover={{ y: -2 }}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
                      <p className="text-[10px] font-medium text-white">{label}</p>
                      <p className="text-[9px] text-gray-600">{desc}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setScreen("permissions")}
                    disabled={loading}
                    className="h-14 rounded-2xl bg-white text-black hover:bg-gray-100 font-bold text-base w-full relative overflow-hidden group"
                    style={{
                      boxShadow: "0 0 40px rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Enter Setup Room <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>

                {error && (
                  <motion.p
                    className="mt-3 text-xs text-red-400 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER: PERMISSIONS SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "permissions") {
    const selectedCompany = COMPANY_STYLES.find((c) => c.id === config.companyStyle);
    const selectedDifficulty = DIFFICULTIES.find((d) => d.id === config.difficulty);
    const selectedLanguage = LANGUAGES_OPT.find((l) => l.id === config.language);

    return (
      <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden flex flex-col justify-center">
        {/* Background Atmosphere */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute inset-0 animate-gradient-mesh opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at 25% 30%, rgba(0, 229, 255, 0.06) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 75% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 50% 90%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)",
            }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
            style={{ background: "rgba(0, 229, 255, 0.04)", top: "-10%", left: "20%" }}
            animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: "rgba(139, 92, 246, 0.035)", bottom: "-5%", right: "15%" }}
            animate={{ x: [0, -30, 35, 0], y: [0, 25, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Device Setup</h1>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Configure and test your camera and microphone for a seamless interview experience.
              </p>
            </div>

            {/* Config & Device Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Left Column: Camera Preview */}
              <div className="flex flex-col gap-4">
                <div className="aspect-[4/3] w-full relative">
                  <LocalVideoPreview stream={videoStream} camOn={camOn} />
                </div>

                {/* Camera Actions */}
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-sm font-semibold">Camera Access</h3>
                    <p className="text-[11px] text-gray-500">Used for focus and expression tracking</p>
                  </div>
                  <Button
                    onClick={handleToggleCam}
                    className={`h-9 px-4 rounded-xl text-xs font-semibold border ${
                      camOn
                        ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                        : "border-white/10 hover:bg-white/5 text-white bg-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {camOn ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                      {camOn ? "Turn Off" : "Turn On"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Right Column: Mic, Preview & Details */}
              <div className="flex flex-col justify-between gap-6">
                {/* Audio Setup Card */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10]/80 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-cyan-400" /> Audio Input
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Speak to test your microphone levels</p>
                    </div>
                    <Button
                      onClick={handleToggleMic}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold border ${
                        micOn
                          ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                          : "border-white/10 hover:bg-white/5 text-white bg-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {micOn ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        {micOn ? "Disable" : "Enable"}
                      </span>
                    </Button>
                  </div>

                  {/* Waveform Visualization Box */}
                  <div className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center overflow-hidden p-2">
                    {micOn && audioStream ? (
                      <div className="text-center w-full">
                        <VoiceWaveform audioStream={audioStream} isActive={micOn} width={280} height={40} />
                        <span className="text-[9px] text-cyan-400/80 font-mono tracking-wider uppercase block mt-1 animate-pulse">
                          Mic Active & Capturing
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 flex flex-col items-center gap-1.5 select-none">
                        <MicOff className="w-6 h-6 text-gray-600" />
                        <span className="text-[10px]">Microphone disabled. Speak indicators hidden.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Summary Card */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10]/80 p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Interview Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Interviewer Style</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <CompanyStyleLogo companyId={config.companyStyle} color={selectedCompany?.color || "#fff"} />
                        {selectedCompany?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Difficulty</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedDifficulty?.color }}
                        />
                        {selectedDifficulty?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Coding Language</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        {selectedLanguage && <selectedLanguage.Icon className={`w-3.5 h-3.5 ${selectedLanguage.iconClassName}`} />}
                        {selectedLanguage?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {(!camOn || !micOn) && (
                  <div className="px-4 py-2.5 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] text-amber-400 text-[10px] leading-normal flex items-start gap-2">
                    <span className="font-bold text-xs">⚠</span>
                    <span>
                      For the most realistic mock interview, we strongly recommend allowing access to both your camera and microphone.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-white/[0.08] pt-6">
              <Button
                onClick={() => {
                  setScreen("lobby");
                  // Turn off streams when going back
                  videoStream?.getTracks().forEach((t) => t.stop());
                  audioStream?.getTracks().forEach((t) => t.stop());
                  setVideoStream(null);
                  setAudioStream(null);
                }}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 rounded-xl px-5 h-11 text-xs"
              >
                Back to Config
              </Button>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={startInterview}
                  disabled={loading}
                  className="h-11 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-xs px-6 relative overflow-hidden group shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Initializing...</>
                    ) : (
                      <>Start Interview <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                    )}
                  </span>
                </Button>
              </motion.div>
            </div>
            {error && (
              <motion.p
                className="mt-3 text-xs text-red-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER: INTERVIEW ROOM
  // ══════════════════════════════════════════════════════════
  if (screen === "room") {
    return (
      <div className="h-screen bg-[#050507] flex overflow-hidden">
        {/* Left: AI Video Experience / Code Editor */}
        <div ref={leftPanelRef} className="w-[65%] h-full relative">
          <AnimatePresence mode="wait">
            {codeMode ? (
              <motion.div
                key="code"
                className="h-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CodeEditorPanel
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  question={question}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  testResults={testResults}
                  codeReview={codeReview}
                  consoleOutput={consoleOutput}
                />
              </motion.div>
            ) : (
              <motion.div
                key="video"
                className="h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AIVideoPanel
                  companyName={persona?.company || "ThinkRank"}
                  companyId={config.companyStyle}
                  elapsed={elapsed}
                  phase={phase}
                  questionIndex={questionIndex}
                  questionTitle={question?.title || ""}
                  isAiThinking={isAiThinking}
                  isAiSpeaking={isAiSpeaking}
                  voiceStatus={interviewerVoice.status}
                  micOn={micOn}
                  camOn={camOn}
                  codeMode={codeMode}
                  isFullscreen={isFullscreen}
                  audioStream={audioStream}
                  onToggleMic={handleToggleMic}
                  onToggleCam={handleToggleCam}
                  onToggleCodeMode={() => setCodeMode(!codeMode)}
                  onToggleFullscreen={handleToggleFullscreen}
                  onScreenShare={() => {}}
                  onAiAssist={() => handleSendMessage("Can you give me a hint or guide me?")}
                  onEndInterview={handleEndInterview}
                  onExit={handleEndInterview}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code mode floating indicator when in code mode */}
          {codeMode && (
            <motion.button
              className="absolute top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl glass-dark hover:bg-white/[0.08] transition-all"
              onClick={() => setCodeMode(false)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-medium text-gray-400">Back to AI View</span>
            </motion.button>
          )}

          {/* Floating User Webcam overlay */}
          <FloatingWebcam stream={videoStream} camOn={camOn} containerRef={leftPanelRef} />
        </div>

        {/* Right: Live Transcript */}
        <div className="w-[35%] h-full">
          <LiveTranscriptPanel
            conversations={conversations}
            isAiThinking={isAiThinking}
            elapsed={elapsed}
            personaName={persona?.name || "AI Interviewer"}
            onSendMessage={handleSendMessage}
            onRequestHint={handleRequestHint}
            onNextQuestion={handleNextQuestion}
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER: REPORT
  // ══════════════════════════════════════════════════════════
  if (screen === "report" && report) {
    const scores = [
      { label: "Overall", value: report.overall_score, color: "#00E5FF" },
      { label: "DSA", value: report.dsa_score, color: "#8B5CF6" },
      { label: "Communication", value: report.communication_score, color: "#10B981" },
      { label: "Code Quality", value: report.code_quality_score, color: "#F59E0B" },
      { label: "Problem Solving", value: report.problem_solving_score, color: "#EC4899" },
      { label: "Optimization", value: report.optimization_score, color: "#06B6D4" },
      { label: "Confidence", value: report.confidence_score, color: "#8B5CF6" },
      { label: "Interview Ready", value: report.interview_readiness, color: "#10B981" },
    ];

    return (
      <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(0, 229, 255, 0.06) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 70% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-1.5 mb-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Star className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">Interview Complete</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                Interview Report
              </h1>
              <p className="text-gray-400 text-sm">
                {persona?.company} Mock Interview — Performance Analysis
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {scores.map(({ label, value, color }, i) => (
                <motion.div
                  key={label}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                  whileHover={{ y: -3 }}
                  style={{
                    boxShadow: `0 0 20px ${color}08`,
                  }}
                >
                  <motion.p
                    className="text-3xl font-bold mb-1.5"
                    style={{ color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    {value}
                  </motion.p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Feedback */}
            <motion.div
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                AI Feedback
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{report.feedback_summary}</p>
            </motion.div>

            {/* Strengths / Weaknesses */}
            <motion.div
              className="grid md:grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5 backdrop-blur-sm">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-3 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {report.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-5 backdrop-blur-sm">
                <h4 className="text-xs font-semibold text-red-400 uppercase mb-3 flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {report.weaknesses?.map((w, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">→</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Study Plan */}
            {report.study_plan && (
              <motion.div
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-8 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <h4 className="text-xs font-semibold text-cyan-400 uppercase mb-4 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3" /> AI Study Plan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(report.study_plan).map(([week, focus]) => (
                    <div key={week} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                      <p className="text-[10px] text-gray-500 uppercase mb-1 font-medium">{week}</p>
                      <p className="text-xs text-white">{focus}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="flex gap-3 justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={() => {
                  setScreen("lobby");
                  setReport(null);
                  setSessionId(null);
                  setConversations([]);
                  setQuestion(null);
                  setPersona(null);
                  setElapsed(0);
                  setCodeMode(false);
                }}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 rounded-xl px-6"
              >
                New Interview
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-black hover:bg-gray-100 rounded-xl px-6"
              >
                Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default MockInterview;
