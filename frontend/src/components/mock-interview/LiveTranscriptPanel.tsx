/**
 * LiveTranscriptPanel — Right 35% of the interview room.
 * Real-time AI transcript with glassmorphic chat bubbles,
 * typing animation, auto-scroll, and message input.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User2, Lightbulb, SkipForward,
  Sparkles, MessageSquare,
} from "lucide-react";
import type { ConversationMessage } from "@/services/mockInterviewAPI";

interface Props {
  conversations: ConversationMessage[];
  isAiThinking: boolean;
  elapsed: number;
  personaName: string;
  onSendMessage: (msg: string) => void;
  onRequestHint: () => void;
  onNextQuestion: () => void;
}

const formatTimestamp = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const LiveTranscriptPanel = ({
  conversations,
  isAiThinking,
  elapsed,
  personaName,
  onSendMessage,
  onRequestHint,
  onNextQuestion,
}: Props) => {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversations, isAiThinking]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col glass-transcript border border-white/[0.08] shadow-2xl shadow-black/20">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-4 border-b border-white/[0.06] bg-[#07080e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-white/[0.06]">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Live Transcript</h3>
              <p className="text-[9px] text-gray-500">
                {conversations.length} messages • {personaName}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRequestHint}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-300 group"
            >
              <Lightbulb className="w-3 h-3 text-amber-400 group-hover:text-amber-300" />
              <span className="text-[9px] font-medium text-amber-400 group-hover:text-amber-300">
                Hint
              </span>
            </button>
            <button
              onClick={onNextQuestion}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300 group"
            >
              <SkipForward className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-[9px] font-medium text-cyan-400 group-hover:text-cyan-300">
                Next Q
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-interview"
      >
        {/* Welcome message if empty */}
        {conversations.length === 0 && !isAiThinking && (
          <motion.div
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center border border-white/[0.06]">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs text-gray-500 max-w-[200px]">
              Your interview conversation will appear here in real-time.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {conversations.map((msg, i) => {
            const isAI = msg.role === "ai";
            const isHint = msg.type === "hint";
            const isCodeReview = msg.type === "code_review";
            const isQuestion = msg.type === "question";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-2.5 ${!isAI ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isAI
                    ? "bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/15"
                    : "bg-gradient-to-br from-violet-500/15 to-violet-500/5 border border-violet-500/15"
                }`}>
                  {isAI ? (
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <User2 className="w-3.5 h-3.5 text-violet-400" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] group ${!isAI ? "text-right" : ""}`}>
                  <div
                    className={`
                      px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed
                      ${isAI
                        ? isHint
                          ? "bg-amber-500/[0.06] border border-amber-500/20 text-amber-200/90"
                          : isCodeReview
                          ? "bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-200/90"
                          : isQuestion
                          ? "bg-cyan-500/[0.06] border border-cyan-500/25 text-cyan-100/90"
                          : "bg-white/[0.03] border border-white/[0.06] text-gray-300 shadow-[0_0_15px_rgba(0,229,255,0.03)]"
                        : "bg-gradient-to-br from-violet-500/15 to-violet-600/10 border border-violet-500/20 text-gray-200 shadow-lg shadow-violet-500/5"
                      }
                    `}
                  >
                    {isHint && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">Hint</span>
                      </div>
                    )}
                    {isCodeReview && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Code Review</span>
                      </div>
                    )}
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>

                  {/* Timestamp */}
                  <div className={`mt-1 flex items-center gap-1 ${!isAI ? "justify-end" : ""}`}>
                    <span className="text-[9px] text-gray-600">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Thinking Animation */}
        <AnimatePresence>
          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/15 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        animate={{
                          y: [0, -5, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">AI is analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Message Input ──────────────────────────────── */}
      <div className="shrink-0 p-4 border-t border-white/[0.06] bg-[#07080e]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to the interviewer..."
              rows={1}
              className="
                w-full px-4 py-3 rounded-[24px]
                bg-white/[0.05] border border-white/[0.08]
                text-xs text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.08]
                resize-none transition-all duration-300
              "
            />
          </div>
          <motion.button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center hover:from-cyan-500/30 hover:to-violet-500/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4 text-cyan-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
