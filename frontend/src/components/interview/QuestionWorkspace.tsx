import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Send, ChevronRight, Code2, Terminal, Play, Maximize2 } from "lucide-react";

interface QuestionWorkspaceProps {
    questionNumber: number;
    totalQuestions: number;
    question: string;
    answer: string;
    setAnswer: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    difficulty?: string;
    onType?: () => void;
}

export const QuestionWorkspace = ({
    questionNumber,
    totalQuestions,
    question,
    answer,
    setAnswer,
    onSubmit,
    isLoading,
    difficulty,
    onType
}: QuestionWorkspaceProps) => {
    // Line numbers logic
    const lineNumbers = answer.split('\n').length;
    const lines = Array.from({ length: Math.max(lineNumbers, 16) }, (_, i) => i + 1);

    // Render markdown-like bold
    const renderContent = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-cyan-300">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="h-full flex flex-col p-6 lg:p-8 relative">
            {/* Header / Meta */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-sm font-mono text-gray-400 mb-1 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-500" />
                        TERMINAL_SESSION_01
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 roundedElement bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
                            TSX
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                            {difficulty || "ADAPTIVE"} MODE
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white font-mono leading-none">
                            {questionNumber < 10 ? `0${questionNumber}` : questionNumber}
                            <span className="text-gray-600 text-lg">/{totalQuestions}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Question Index</div>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                        <div className="w-full h-full rounded-full border-2 border-cyan-500"
                            style={{ clipPath: `inset(0 0 ${100 - (questionNumber / totalQuestions) * 100}% 0)` }} />
                    </div>
                </div>
            </div>

            {/* Question Display */}
            <motion.div
                key={question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="bg-[#13131A] border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden group max-h-[30vh] overflow-y-auto custom-scrollbar">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-violet-500" />
                    <h3 className="text-xl md:text-2xl font-light text-white leading-relaxed tracking-wide">
                        {renderContent(question)}
                    </h3>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity sticky">
                        <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                            <Maximize2 className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Editor Container */}
            <div className="flex-1 flex flex-col min-h-0 relative group">
                {/* Glow effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex-1 flex flex-col bg-[#0A0A0B] rounded-xl border border-white/10 overflow-hidden relative z-10 shadow-2xl min-h-0">
                    {/* Toolbar */}
                    <div className="bg-[#13131A] border-b border-white/5 px-4 py-2.5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                <Code2 className="w-3.5 h-3.5" />
                                solution.ts
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">AUTOSAVE: ON</div>
                    </div>

                    {/* Editor & Line Numbers */}
                    <div className="flex-1 flex relative overflow-hidden bg-[#0A0A0B]/80 backdrop-blur-sm min-h-0">
                        <div className="w-12 py-4 flex flex-col items-end pr-4 text-xs font-mono text-gray-700 select-none bg-[#0F0F16] border-r border-white/5 h-full overflow-hidden">
                            {lines.map(num => (
                                <div key={num} className="h-6 leading-6">{num}</div>
                            ))}
                        </div>

                        <textarea
                            value={answer}
                            onChange={(e) => {
                                setAnswer(e.target.value);
                                onType?.();
                            }}
                            className="flex-1 bg-transparent border-0 p-4 pl-4 text-sm font-mono text-gray-300 focus:ring-0 focus:outline-none resize-none leading-6 placeholder:text-gray-700 custom-scrollbar selection:bg-cyan-500/20 h-full"
                            placeholder="// Write your solution here..."
                            spellCheck={false}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 flex justify-end shrink-0 relative z-30">
                <Button
                    onClick={onSubmit}
                    disabled={!answer.trim() || isLoading}
                    size="lg"
                    className={`
                        bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                        text-white font-bold tracking-wide shadow-xl shadow-cyan-500/10 
                        rounded-xl h-14 px-10 transition-all hover:scale-[1.02] active:scale-95 border border-white/10
                        ${!answer.trim() ? 'opacity-50 grayscale' : 'opacity-100'}
                    `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            COMPILING...
                        </>
                    ) : (
                        <>
                            SUBMIT SOLUTION
                            <Send className="w-5 h-5 ml-3" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
