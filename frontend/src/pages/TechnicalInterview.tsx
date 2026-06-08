import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/NeuralBackground";
import { useAuth } from "@/contexts/AuthContext";
import { RecruiterPanel } from "@/components/interview/RecruiterPanel";
import { QuestionWorkspace } from "@/components/interview/QuestionWorkspace";
import { InterviewReport } from "@/components/interview/InterviewReport";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
    ArrowRight,
    Loader2,
    ChevronRight,
    Play,
    Terminal,
    Cpu,
    ShieldCheck,
    Settings,
    Maximize
} from "lucide-react";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";

interface Skill {
    name: string;
    color: string;
    textColor: string;
}

interface StoredSkills {
    skills: Skill[];
}

interface Evaluation {
    score: number;
    feedback: string;
    strengths?: string;
    improvements?: string;
    classification?: "wrong" | "partial" | "correct";
    matchedKeywords?: string[];
    matchPercentage?: number;
    recruiterMessage?: string;
}

interface QuestionData {
    topic: string;
    subtopic: string;
    difficulty: string;
    expected_keywords: string[];
    follow_ups: Record<string, string[]>;
    isFollowUp: boolean;
}

interface AnswerResult {
    questionNumber: number;
    question: string;
    answer: string;
    evaluation: Evaluation;
    classification?: string;
    topic?: string;
    subtopic?: string;
}

const TechnicalInterview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const sounds = useSoundEffects();

    // Core interview state
    const [skills, setSkills] = useState<Skill[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string>("");
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
    const [totalQuestions] = useState(10);
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
    const [results, setResults] = useState<AnswerResult[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [averageScore, setAverageScore] = useState(0);
    const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);

    // Follow-up engine state
    const [questionData, setQuestionData] = useState<QuestionData | null>(null);
    const [currentTopic, setCurrentTopic] = useState<string>("");
    const [currentSubtopic, setCurrentSubtopic] = useState<string>("");
    const [attemptCount, setAttemptCount] = useState(0);
    const [classification, setClassification] = useState<"wrong" | "partial" | "correct" | null>(null);
    const [recruiterMessage, setRecruiterMessage] = useState("");
    const [hint, setHint] = useState<string | null>(null);
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [topicAttempts, setTopicAttempts] = useState<Record<string, number>>({});
    const [interviewReport, setInterviewReport] = useState<any>(null);
    const [mobileTab, setMobileTab] = useState<'workspace' | 'recruiter'>('workspace');

    // Load skills on mount
    useEffect(() => {
        const storedSkills = localStorage.getItem("extractedSkills");
        if (storedSkills) {
            try {
                const parsed: StoredSkills = JSON.parse(storedSkills);
                setSkills(parsed.skills || []);
            } catch (e) {
                console.error("Failed to parse skills", e);
            }
        }
    }, []);

    // Effect for Recruiter Message Sound
    useEffect(() => {
        if (recruiterMessage) {
            sounds.playMessage();
        }
    }, [recruiterMessage]);

    // Start interview
    const startInterview = async () => {
        sounds.playClick();

        if (skills.length === 0) {
            setError("No skills detected. Initiate skill extraction protocol first.");
            sounds.playError();
            return;
        }

        setIsLoading(true);
        setLoadingMessage("INITIALIZING NEURAL INTERFACE...");
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    skills: skills.map(s => s.name),
                    userId: user?.id,
                    useFollowUpEngine: true,
                }),
            });

            const data = await parseApiResponse(response);

            if (!data.success) {
                throw new Error(data.error || "System Initialization Failed");
            }

            sounds.playSuccess();
            setSessionId(data.data.sessionId);
            setCurrentQuestion(data.data.question);
            setCurrentQuestionNumber(1);
            setPreviousQuestions([data.data.question]);

            if (data.data.questionData) {
                setQuestionData(data.data.questionData);
                setCurrentTopic(data.data.currentTopic || data.data.questionData.topic);
                setCurrentSubtopic(data.data.currentSubtopic || data.data.questionData.subtopic);
            }
            setRecruiterMessage(data.data.recruiterMessage || "System ready. Begin analysis.");
            setAttemptCount(0);
            setIsFollowUp(false);
            setInterviewReport(null); // Reset report
        } catch (err: unknown) {
            sounds.playError();
            setError(err instanceof Error ? err.message : "Connection Error");
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!answer.trim()) return;
        sounds.playClick();

        setIsLoading(true);
        // Random "processing" technical jargon
        const loadingTexts = ["ANALYZING SYNTAX...", "EVALUATING SEMANTICS...", "COMPILING RESPONSE...", "RUNNING TEST CASES..."];
        setLoadingMessage(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    questionNumber: currentQuestionNumber,
                    question: currentQuestion,
                    answer: answer.trim(),
                    skills: skills.map(s => s.name),
                    userId: user?.id,
                    previousQuestions,
                    questionData,
                    topicAttempts,
                    useFollowUpEngine: true,
                }),
            });

            const data = await parseApiResponse(response);

            if (!data.success) {
                throw new Error(data.error || "Submission Failed");
            }

            // Classification feedback sounds
            if (data.data.classification === 'correct') {
                sounds.playSuccess();
            } else if (data.data.classification === 'wrong') {
                sounds.playError();
            } else {
                sounds.playMessage(); // Partial gets a message ping
            }

            const evaluation = data.data.evaluation;
            const result: AnswerResult = {
                questionNumber: currentQuestionNumber,
                question: currentQuestion,
                answer: answer.trim(),
                evaluation,
                classification: data.data.classification,
                topic: currentTopic,
                subtopic: currentSubtopic,
            };
            setResults(prev => [...prev, result]);

            setClassification(data.data.classification || null);
            setLastEvaluation(evaluation);

            if (data.data.isComplete) {
                setIsComplete(true);
                setAverageScore(data.data.averageScore);
                setRecruiterMessage(data.data.recruiterMessage || "Session Concluded.");
                if (data.data.interviewReport) {
                    setInterviewReport(data.data.interviewReport);
                }
                sounds.playSuccess(); // Extra chime for completion

                // Save results in background
                if (user?.id) {
                    saveResults(data.data.averageScore, currentQuestionNumber);
                }
            } else {
                // Delay for visual feedback before next question
                setTimeout(() => {
                    setCurrentQuestion(data.data.nextQuestion);
                    setCurrentQuestionNumber(data.data.nextQuestionNumber);
                    setPreviousQuestions(prev => [...prev, data.data.nextQuestion]);
                    setAnswer("");
                    // setLastEvaluation(null); // Keep last evaluation for sidebar context

                    if (data.data.nextQuestionData) {
                        setQuestionData(data.data.nextQuestionData);
                    }
                    setCurrentTopic(data.data.currentTopic || currentTopic);
                    setCurrentSubtopic(data.data.currentSubtopic || currentSubtopic);
                    setAttemptCount(data.data.attemptCount || 0);
                    setIsFollowUp(data.data.isFollowUp || false);
                    setRecruiterMessage(data.data.recruiterMessage || "");
                    setHint(data.data.hint || null);
                    if (data.data.topicAttempts) {
                        setTopicAttempts(data.data.topicAttempts);
                    }
                }, 2000);
            }
        } catch (err: unknown) {
            sounds.playError();
            setError(err instanceof Error ? err.message : "Submission Failed");
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const saveResults = async (avgScore: number, totalQs: number) => {
        const skillNames = skills.map(s => s.name);
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/save-results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    skill: skillNames.length > 3 ? `${skillNames.slice(0, 3).join(", ")} +${skillNames.length - 3}` : skillNames.join(", "),
                    skillsArray: skillNames,
                    averageScore: avgScore,
                    totalQuestions: totalQs,
                    correctAnswers: Math.round((avgScore / 10) * totalQs),
                    xpEarned: Math.round(avgScore * 10),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to save interview results:", response.status, errorData);
            } else {
                const data = await response.json();
                console.log("Interview results saved successfully:", data);
            }
        } catch (saveErr) {
            console.error("Failed to save interview results (network error):", saveErr);
        }
    };

    // Render: Start Screen (Immersive Mode)
    if (currentQuestionNumber === 0 && !isComplete) {
        const BOOT_LINES = [
            "Initializing neural assessment engine...",
            "Loading adaptive question bank...",
            "Calibrating difficulty matrix...",
            "Connecting to evaluation pipeline...",
            "System ready.",
        ];

        const BootSequence = () => {
            const [lines, setLines] = useState<string[]>([]);
            const [idx, setIdx] = useState(0);
            useEffect(() => {
                if (idx >= BOOT_LINES.length) {
                    const t = setTimeout(() => { setLines([]); setIdx(0); }, 3000);
                    return () => clearTimeout(t);
                }
                const t = setTimeout(() => {
                    setLines((p) => [...p, BOOT_LINES[idx]]);
                    setIdx((i) => i + 1);
                }, 600);
                return () => clearTimeout(t);
            }, [idx]);

            return (
                <div className="rounded-xl border border-white/[0.06] bg-[#08080C] font-mono text-sm p-5 min-h-[170px]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        <span className="ml-3 text-gray-600 text-xs">skill-genome — boot</span>
                    </div>
                    <div className="space-y-1.5">
                        {lines.map((line, i) => (
                            <motion.div key={`${i}-${line}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                                <span className="text-emerald-400 text-xs">✓</span>
                                <span className="text-gray-400 text-xs">{line}</span>
                            </motion.div>
                        ))}
                        {idx < BOOT_LINES.length && lines.length > 0 && (
                            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="inline-block w-2 h-4 bg-cyan-400 ml-5" />
                        )}
                    </div>
                </div>
            );
        };

        const FEATURES = [
            { icon: Terminal, title: "Adaptive Engine", desc: "Questions scale with your performance", color: "#06B6D4" },
            { icon: ShieldCheck, title: "Follow-up Logic", desc: "Wrong answers trigger deeper probing", color: "#8B5CF6" },
            { icon: Cpu, title: "AI Evaluation", desc: "Real-time scoring & classification", color: "#10B981" },
            { icon: Play, title: "10 Rounds", desc: "Comprehensive skill coverage", color: "#F59E0B" },
        ];

        return (
            <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
                {/* Ambient effects */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[130px]" />
                    <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px]" />
                </div>

                {/* Grid pattern */}
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="container mx-auto px-4 lg:px-6 pt-14 pb-24 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto">

                        {/* Accent line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-14" />

                        <div className="grid lg:grid-cols-2 gap-14 items-start">
                            {/* LEFT */}
                            <div>
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-1.5 mb-7">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-xs font-medium text-cyan-300 tracking-wide">Skill Genome — Assessment Mode</span>
                                </div>

                                {/* Headline */}
                                <h1 className="text-5xl md:text-[3.4rem] font-bold tracking-tight leading-[1.1] mb-4 font-display">
                                    Technical
                                    <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                                        Interview
                                    </span>
                                </h1>
                                <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
                                    Adaptive neural assessment that analyzes your technical depth, follows up on weak areas, and scores you in real-time against industry benchmarks.
                                </p>

                                {/* Skill Matrix */}
                                <div className="mb-8">
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Detected Skill Matrix</p>
                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {skills.map((skill) => (
                                                <span
                                                    key={skill.name}
                                                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-300 flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skill.color }} />
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-dashed border-amber-500/25 rounded-xl bg-amber-500/[0.04]">
                                            <p className="text-amber-400 text-sm flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                No skills synced — build your genome first
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* CTA */}
                                <Button
                                    onClick={startInterview}
                                    disabled={isLoading || skills.length === 0}
                                    className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-gray-100 font-bold text-base transition-all duration-200 hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                            {loadingMessage}
                                        </>
                                    ) : (
                                        <>
                                            Launch Assessment
                                            <ArrowRight className="w-5 h-5 ml-3" />
                                        </>
                                    )}
                                </Button>
                                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                            </div>

                            {/* RIGHT */}
                            <div className="space-y-5">
                                <BootSequence />

                                {/* Feature grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                                        <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all duration-200">
                                            <div
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3"
                                                style={{ backgroundColor: `${color}15` }}
                                            >
                                                <Icon className="w-4 h-4" style={{ color }} />
                                            </div>
                                            <div className="font-semibold text-sm text-white mb-1">{title}</div>
                                            <div className="text-xs text-gray-500 leading-snug">{desc}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats strip */}
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center justify-between text-center">
                                    {[["10", "Rounds"], ["AI", "Scoring"], ["Adaptive", "Difficulty"], ["Real-time", "Follow-ups"]].map(([val, label]) => (
                                        <div key={label}>
                                            <div className="text-lg font-bold text-white">{val}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
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

    // Render: Results Screen (Mission Report)
    if (isComplete) {
        if (interviewReport) {
            return (
                <div className="min-h-screen bg-[#050505] font-sans text-gray-100 relative overflow-hidden flex flex-col">
                    <NeuralBackground />
                    <div className="flex-1 overflow-auto relative z-10 pt-10 pb-10">
                        <InterviewReport
                            report={interviewReport}
                            onRestart={() => { sounds.playClick(); window.location.reload(); }}
                            onDashboard={() => { sounds.playClick(); navigate("/dashboard"); }}
                        />
                    </div>
                </div>
            );
        }
        // Fallback for missing report
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Processing Results...</h1>
                    <Button onClick={() => window.location.reload()}>Reload</Button>
                </div>
            </div>
        );
    }

    // Move this to top level


    // ... (rest of logic)

    // Render: Main Console Interface (Immersive Mode)
    return (
        <div className="h-screen bg-[#050507] font-sans text-gray-100 flex flex-col overflow-hidden relative selection:bg-cyan-500/30">

            {/* Top HUD */}
            <header className="h-14 border-b border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                        SG
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-sm font-bold text-white tracking-wide">INTERVIEW PROTOCOL</h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">SECURE CONNECTION ESTABLISHED</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Tabs */}
                    <div className="flex md:hidden bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setMobileTab('recruiter')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mobileTab === 'recruiter' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                        >
                            Briefing
                        </button>
                        <button
                            onClick={() => setMobileTab('workspace')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mobileTab === 'workspace' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                        >
                            Code
                        </button>
                    </div>

                    <Button variant="ghost" size="icon" className="hover:bg-white/5">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative z-20">
                {/* Left Panel: Recruiter Comms */}
                <aside className={`
                    w-full md:w-[300px] lg:w-[380px] 
                    flex flex-col border-r border-white/[0.06] relative z-30 h-full bg-[#0A0A0F]
                    absolute md:relative inset-0
                    transition-transform duration-300 ease-in-out
                    ${mobileTab === 'recruiter' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <RecruiterPanel
                        recruiterMessage={recruiterMessage}
                        currentTopic={currentTopic}
                        currentSubtopic={currentSubtopic}
                        attemptCount={attemptCount}
                        hint={hint}
                        isFollowUp={isFollowUp}
                        classification={classification}
                        lastEvaluation={lastEvaluation}
                    />
                </aside>

                {/* Right Panel: Workspace */}
                <main className={`
                    flex-1 h-full relative overflow-hidden bg-[#0C0C10]
                    transition-transform duration-300 ease-in-out
                    absolute md:relative inset-0 md:translate-x-0
                    ${mobileTab === 'workspace' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
                    <QuestionWorkspace
                        questionNumber={currentQuestionNumber}
                        totalQuestions={10}
                        question={currentQuestion}
                        answer={answer}
                        setAnswer={setAnswer}
                        onSubmit={submitAnswer}
                        isLoading={isLoading}
                        difficulty={questionData?.difficulty}
                        onType={sounds.playTyping}
                    />
                </main>
            </div>
        </div>
    );
};

export default TechnicalInterview;
