/**
 * AI Interviewer Panel — Left side of the interview room.
 * Shows AI avatar, conversation, question, timer, and controls.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Clock, Send, Lightbulb,
  ChevronRight, Brain, Sparkles, SkipForward, Phone,
  AlertTriangle, User2, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationMessage, InterviewQuestion, AIPersona } from "@/services/mockInterviewAPI";

interface Props {
  persona: AIPersona | null;
  question: InterviewQuestion | null;
  conversations: ConversationMessage[];
  elapsed: number;
  phase: string;
  questionIndex: number;
  isAiThinking: boolean;
  onSendMessage: (msg: string) => void;
  onRequestHint: () => void;
  onNextQuestion: () => void;
  onEndInterview: () => void;
  micOn: boolean;
  onToggleMic: () => void;
  audioStream: MediaStream | null;
}

export const AIInterviewerPanel = ({
  persona, question, conversations, elapsed, phase,
  questionIndex, isAiThinking, onSendMessage, onRequestHint,
  onNextQuestion, onEndInterview, micOn, onToggleMic, audioStream
}: Props) => {
  const [message, setMessage] = useState("");
  const [camOn, setCamOn] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [conversations]);

  // Double-sided dynamic visualizer using Web Audio API
  useEffect(() => {
    if (!audioStream || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const draw = () => {
        if (!canvasRef.current) return;
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2.5;

          const gradient = ctx.createLinearGradient(
            0, canvas.height / 2 - barHeight / 2,
            0, canvas.height / 2 + barHeight / 2
          );
          gradient.addColorStop(0, "#06B6D4"); // cyan-400
          gradient.addColorStop(1, "#8B5CF6"); // violet-500

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        audioCtx.close();
      };
    } catch (e) {
      console.warn("Speech API visualizer failed to initialize:", e);
    }
  }, [audioStream]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  const phaseLabel = {
    clarification: "Clarifying",
    coding: "Coding",
    review: "Code Review",
    follow_up: "Follow-up",
  }[phase] || phase;

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F] border-r border-white/[0.06]">
      {/* AI Avatar Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* AI Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {isAiThinking && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl border-2 border-cyan-400/50"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0A0A0F]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{persona?.name || "AI Interviewer"}</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{persona?.company || "ThinkRank"}</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-white">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Q{questionIndex + 1}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {phaseLabel}
          </span>
          {isAiThinking && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"
            >
              <motion.div
                className="w-1 h-1 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              Thinking...
            </motion.span>
          )}
        </div>
      </div>

      {/* Question Card (Collapsible) */}
      {question && (
        <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <h4 className="text-xs font-semibold text-white">{question.title}</h4>
            <span className="ml-auto text-[10px] text-gray-500 uppercase">{question.category}</span>
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
            {question.description.slice(0, 200)}...
          </p>
        </div>
      )}

      {/* Waveform Visualizer overlay */}
      {micOn && (
        <div className="px-4 py-2 border-b border-cyan-500/10 bg-cyan-500/[0.02] flex items-center justify-between">
          <span className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Recording...
          </span>
          <canvas
            ref={canvasRef}
            width={120}
            height={20}
            className="w-[120px] h-[20px] rounded"
          />
        </div>
      )}

      {/* Conversation */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        <AnimatePresence>
          {conversations.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "ai" ? "bg-cyan-500/15" : "bg-violet-500/15"
              }`}>
                {msg.role === "ai" ? (
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <User2 className="w-3.5 h-3.5 text-violet-400" />
                )}
              </div>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                msg.role === "ai"
                  ? "bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                  : "bg-violet-500/15 text-gray-200 border border-violet-500/20"
              } ${msg.type === "hint" ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Thinking Animation */}
        {isAiThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-white/[0.06] flex gap-2">
        <Button
          variant="ghost" size="sm"
          onClick={onRequestHint}
          className="h-7 px-2.5 text-[10px] text-amber-400 hover:bg-amber-500/10"
        >
          <Lightbulb className="w-3 h-3 mr-1" /> Hint
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={onNextQuestion}
          className="h-7 px-2.5 text-[10px] text-cyan-400 hover:bg-cyan-500/10"
        >
          <SkipForward className="w-3 h-3 mr-1" /> Next Q
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={onEndInterview}
          className="h-7 px-2.5 text-[10px] text-red-400 hover:bg-red-500/10 ml-auto"
        >
          <Phone className="w-3 h-3 mr-1" /> End
        </Button>
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message to the interviewer..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30"
          />
          <Button onClick={handleSend} size="sm" className="h-9 w-9 p-0 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Media Controls */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onToggleMic}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-semibold ${
              micOn ? "bg-red-500/20 text-red-400 border border-red-500/20" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
            }`}
          >
            {micOn ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {micOn ? "Mute Microphone" : "Tap to Speak"}
          </button>
          <button onClick={() => setCamOn(!camOn)} className={`p-1.5 rounded-lg transition-colors ${camOn ? "bg-white/[0.04] text-gray-400" : "bg-red-500/20 text-red-400"}`}>
            {camOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
