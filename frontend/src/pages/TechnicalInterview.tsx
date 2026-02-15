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
        return (
            <div className="min-h-screen bg-[#050505] font-sans text-gray-100 relative overflow-hidden flex flex-col items-center justify-center">
                <NeuralBackground />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-4xl w-full p-4"
                >
                    <div className="bg-[#0A0A0B]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                        {/* Decorative Top Bar */}
                        <div className="h-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-indigo-600 w-full" />

                        <div className="grid md:grid-cols-2">
                            {/* Left Content */}
                            <div className="p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-lg">
                                        <Cpu className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                        Skill Genome <span className="text-cyan-400">Interview</span>
                                    </h1>
                                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                        Enter the adaptive neural assessment chamber. The system will analyze your technical depth and critical thinking in real-time.
                                    </p>
                                    <Button
                                        onClick={startInterview}
                                        disabled={isLoading || skills.length === 0}
                                        className="h-14 px-8 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-xl tracking-wide transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                                {loadingMessage}
                                            </>
                                        ) : (
                                            <>
                                                INITIALIZE SESSION
                                                <ArrowRight className="w-5 h-5 ml-3" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Right Content (Skill Grid) */}
                            <div className="bg-[#0F0F16] p-12 flex flex-col border-l border-white/5 relative">
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 font-mono">
                                        Detected Skill Matrix
                                    </h3>
                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill) => (
                                                <div key={skill.name} className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm font-medium text-gray-300">
                                                    {skill.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 border border-dashed border-red-500/30 rounded-xl bg-red-500/5">
                                            <p className="text-red-400 text-sm flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                NO SKILLS SYNCED
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between text-xs font-mono text-gray-600">
                                    <span>V2.4.0 STABLE</span>
                                    <span>LATENCY: 12ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
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
        <div className="h-screen bg-[#050505] font-sans text-gray-100 flex flex-col overflow-hidden relative selection:bg-cyan-500/30">
            <NeuralBackground />

            {/* Top HUD */}
            <header className="h-16 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
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
                    flex flex-col border-r border-white/5 relative z-30 h-full bg-[#050505]
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
                    flex-1 h-full relative overflow-hidden bg-[#0A0A0B]
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
