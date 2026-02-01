import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Lightbulb,
    Zap,
    Brain,
    CheckCircle,
    XCircle,
    AlertCircle,
    Terminal,
    Activity
} from "lucide-react";

interface RecruiterPanelProps {
    recruiterMessage: string;
    currentTopic: string;
    currentSubtopic: string;
    attemptCount: number;
    hint: string | null;
    isFollowUp: boolean;
    classification: "wrong" | "partial" | "correct" | null;
    lastEvaluation: {
        score: number;
        feedback: string;
    } | null;
}

export const RecruiterPanel = ({
    recruiterMessage,
    currentTopic,
    currentSubtopic,
    attemptCount,
    hint,
    isFollowUp,
    classification,
    lastEvaluation
}: RecruiterPanelProps) => {
    return (
        <div className="h-full flex flex-col bg-[#050508] border-r border-white/5 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-64 bg-violet-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />

            {/* Header / Identity Area */}
            <div className="px-6 py-8 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        {/* Outer Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                        <div className="relative w-14 h-14 rounded-2xl bg-[#0A0A0B] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                            <Brain className="w-7 h-7 text-cyan-400 animate-pulse" />
                            {/* Scanning Line */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1/2 w-full animate-scan" style={{ animation: 'scan 3s linear infinite' }} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">AI RECRUITER</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 10, 4] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                        className="w-0.5 bg-emerald-500/60 rounded-full"
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-[0.2em] uppercase">Neural Link Active</span>
                        </div>
                    </div>
                </div>

                {/* Focus Protocol Card */}
                <div className="mt-8 bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono text-gray-500 tracking-[0.3em] uppercase">Current Protocol</span>
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 font-mono">
                            ATTEMPT_0{attemptCount + 1}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <Target className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white block mb-0.5 leading-tight">
                                {currentTopic || "SYSTEM_INITIALIZING..."}
                            </span>
                            {currentSubtopic && (
                                <span className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 uppercase tracking-wider">
                                    <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
                                    {currentSubtopic}
                                </span>
                            )}
                        </div>
                    </div>

                    {isFollowUp && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400/80 bg-amber-400/5 px-2 py-1 rounded border border-amber-400/10">
                                <Zap className="w-3 h-3 animate-pulse" />
                                ADAPTIVE_DIAGNOSTICS_ENGAGED
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat/Evaluation Feed */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-8 custom-scrollbar relative z-10">
                <AnimatePresence mode="popLayout">
                    {/* Previous Result / Marks Card */}
                    {lastEvaluation && (
                        <motion.div
                            key="evaluation"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2 pl-1">
                                <Terminal className="w-3 h-3 text-gray-600" />
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em]">Previous Evaluation</span>
                            </div>

                            <div className={`relative rounded-2xl p-5 border shadow-lg overflow-hidden ${classification === 'correct' ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5' :
                                    classification === 'partial' ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-amber-500/5' :
                                        'bg-red-500/[0.03] border-red-500/20 shadow-red-500/5'
                                }`}>
                                {/* Status Icon & Title */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${classification === 'correct' ? 'text-emerald-400' :
                                            classification === 'partial' ? 'text-amber-400' : 'text-red-400'
                                        }`}>
                                        {classification === 'correct' ? <CheckCircle className="w-3.5 h-3.5" /> :
                                            classification === 'partial' ? <AlertCircle className="w-3.5 h-3.5" /> :
                                                <XCircle className="w-3.5 h-3.5" />}
                                        {classification || 'EVALUATED'}
                                    </div>
                                    <div className="text-xl font-mono font-bold text-white/50">
                                        {lastEvaluation.score}<span className="text-[10px] text-gray-600 ml-1">/10</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-300 leading-relaxed font-light italic">
                                    "{lastEvaluation.feedback}"
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* New Message Bubble */}
                    {recruiterMessage && (
                        <motion.div
                            key={recruiterMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2 pl-1">
                                <Activity className="w-3 h-3 text-cyan-500/60" />
                                <span className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-[0.2em]">Incoming Comms</span>
                                <div className="flex-1 h-px bg-cyan-500/10 ml-2"></div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-[0.5px] bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                                <div className="relative bg-[#0F0F16] border border-white/10 rounded-2xl p-5 text-[15px] text-gray-200 leading-relaxed shadow-2xl font-light">
                                    {recruiterMessage}
                                    {/* Tech Ornament */}
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-1.5 h-1.5 border-t border-r border-white/20"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-1">
                                        <div className="w-1.5 h-1.5 border-b border-l border-white/20"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Hint Component */}
                    {hint && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 shadow-inner"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Lightbulb className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Tactical Hint</span>
                                    <p className="text-[13px] text-blue-100/70 leading-relaxed">
                                        {hint}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Matrix Overlay (Subtle) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
        </div>
    );
};
