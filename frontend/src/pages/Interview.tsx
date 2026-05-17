import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { NeuralBackground } from "@/components/NeuralBackground";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
    Play,
    Mic,
    Video,
    Clock,
    Target,
    Brain,
    Sparkles,
    ChevronRight,
    Zap,
    Award,
    Lock,
    CheckCircle,
    Star,
    MessageSquare,
    Code,
    Users,
    Briefcase,
    Activity,
    Cpu,
    Database,
    Network,
    TerminalSquare
} from "lucide-react";

interface Skill {
    name: string;
    color: string;
    textColor: string;
}

interface StoredSkills {
    skills: Skill[];
    repoCount?: number;
    username?: string;
    filename?: string;
}

const Interview = () => {
    const [extractedSkills, setExtractedSkills] = useState<StoredSkills | null>(null);
    const [selectedInterviewType, setSelectedInterviewType] = useState<string | null>(null);
    const [launching, setLaunching] = useState(false);
    const navigate = useNavigate();
    const sounds = useSoundEffects();

    useEffect(() => {
        const storedSkills = localStorage.getItem("extractedSkills");
        if (storedSkills) {
            try {
                setExtractedSkills(JSON.parse(storedSkills));
            } catch (e) {
                console.error("Failed to parse stored skills", e);
            }
        }
    }, []);

    const handleLaunch = (typeId: string) => {
        sounds.playClick();
        setSelectedInterviewType(typeId);
        setLaunching(true);

        // Simulate system initialize
        setTimeout(() => {
            if (typeId === 'technical') {
                navigate("/interview/technical");
            } else if (typeId === 'interview-os') {
                navigate("/interview-os");
            } else {
                // For now, other modes also route to technical or show a toast (simulated here by just routing)
                // In a real app, these would have their own routes. 
                // We'll route to technical but with a query param in a real scenario, 
                // but for now let's just use the technical route as the "simulation engine".
                navigate("/interview/technical");
            }
        }, 1500);
    };

    const interviewTypes = [
        {
            id: "interview-os",
            title: "InterviewOS",
            subtitle: "ADAPTIVE_LEETCODE_AI",
            description: "Production-style adaptive coding interview engine with hidden problem metadata and integrity monitoring.",
            icon: Brain,
            duration: "LIVE",
            difficulty: "HIDDEN",
            gradient: "from-emerald-400 to-cyan-500",
            bgGradient: "from-emerald-500/10 to-cyan-500/5",
            border: "emerald",
            available: true,
            features: ["Hidden Metadata", "Adaptive Rounds", "Integrity Score"]
        },
        {
            id: "technical",
            title: "Technical Protocol",
            subtitle: "ALGORITHM_BENCHMARK",
            description: "Deep dive into data structures, system design, and coding challenges.",
            icon: TerminalSquare,
            duration: "AUTO",
            difficulty: "ADAPTIVE",
            gradient: "from-cyan-400 to-blue-500",
            bgGradient: "from-cyan-500/10 to-blue-500/5",
            border: "cyan",
            available: true,
            features: ["Live Execution", "Memory Profiling", "Edge Case Analysis"]
        },
        {
            id: "system-design",
            title: "System Design",
            subtitle: "ARCHITECTURE_SIM",
            description: "High-level distributed systems, scalability, and database design.",
            icon: Network,
            duration: "60 MIN",
            difficulty: "HARD",
            gradient: "from-violet-400 to-purple-500",
            bgGradient: "from-violet-500/10 to-purple-500/5",
            border: "violet",
            available: true,
            features: ["Whiteboard Mode", "Load Balancing", "Schema Design"]
        },
        {
            id: "behavioral",
            title: "Behavioral Analysis",
            subtitle: "PSYCHOMETRIC_EVAL",
            description: "STAR method assessment for leadership, conflict, and culture fit.",
            icon: Users,
            duration: "45 MIN",
            difficulty: "MEDIUM",
            gradient: "from-pink-400 to-rose-500",
            bgGradient: "from-pink-500/10 to-rose-500/5",
            border: "pink",
            available: true,
            features: ["Sentiment Analysis", "Tone Detection", "Core Values"]
        },
        {
            id: "manager",
            title: "Leadership Core",
            subtitle: "MANAGEMENT_TRACK",
            description: "Strategic thinking, team management, and delivery execution.",
            icon: Briefcase,
            duration: "60 MIN",
            difficulty: "EXPERT",
            gradient: "from-emerald-400 to-green-500",
            bgGradient: "from-emerald-500/10 to-green-500/5",
            border: "emerald",
            available: true,
            features: ["Conflict Res", "Roadmapping", "hiring_sim.exe"]
        },
    ];

    const stats = [
        { label: "PROTOCOL VERSION", value: "v2.5.1", icon: Cpu },
        { label: "AVG. PERFORMANCE", value: "Top 5%", icon: Activity },
        { label: "GLOBAL RANK", value: "#42", icon: Award },
        { label: "SYSTEM STATUS", value: "OPTIMAL", icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans pb-20">
            <NeuralBackground />

            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-900/10 to-transparent pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-6 relative z-10 pt-8">

                {/* Dashboard Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center gap-2 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                ONLINE
                            </span>
                            <span className="text-xs font-mono text-gray-500">ID: {extractedSkills?.username?.toUpperCase() || "CANDIDATE_01"}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                            Mission Control
                        </h1>
                        <p className="text-gray-400 mt-2 max-w-xl">
                            Select a simulation module to begin your assessment. All neural networks are online and ready for processing.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="hidden lg:block bg-[#0A0A0B]/50 border border-white/5 rounded-xl p-3 min-w-[140px]">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 font-mono">
                                    <stat.icon className="w-3 h-3" />
                                    {stat.label}
                                </div>
                                <div className="text-lg font-bold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left Col: Genome Identity (Skills) */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-24 bg-cyan-500/5 blur-3xl rounded-full" />

                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <DnaIcon />
                                Genome Identity
                            </h3>

                            {extractedSkills && extractedSkills.skills.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {extractedSkills.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skill.color }} />
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                                            <span>SKILL SYNTHESIS</span>
                                            <span>{extractedSkills.skills.length * 12}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                                style={{ width: `${Math.min(extractedSkills.skills.length * 12, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">
                                    No genome data detected.
                                </div>
                            )}

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-2xl" />
                        </motion.div>

                        {/* Quick Actions / Tips */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-violet-900/20 to-purple-900/10 border border-violet-500/20 rounded-2xl p-6"
                        >
                            <h4 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Pro Tip
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                The Behavioral module is now unlocked. Use it to practice your STAR responses layout. The AI will analyze your voice tone and confidence.
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Col: Simulation Modules */}
                    <div className="lg:col-span-8">
                        <div className="grid md:grid-cols-2 gap-4">
                            {interviewTypes.map((type, index) => (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    onClick={() => handleLaunch(type.id)}
                                    className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 bg-[#0A0A0B]/60 hover:bg-[#0A0A0B]
                                        ${selectedInterviewType === type.id
                                            ? `border-${type.border}-500/60 ring-1 ring-${type.border}-500/50`
                                            : "border-white/5 hover:border-white/20"}
                                    `}
                                >
                                    {/* Active Gradient Background on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${type.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Selection Glow */}
                                    {selectedInterviewType === type.id && (
                                        <div className={`absolute inset-0 bg-${type.border}-500/10`} />
                                    )}

                                    <div className="p-6 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${type.gradient} text-white shadow-lg shadow-${type.border}-500/20`}>
                                                <type.icon className="w-6 h-6" />
                                            </div>
                                            {selectedInterviewType === type.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${type.border}-400 opacity-75`}></span>
                                                        <span className={`relative inline-flex rounded-full h-3 w-3 bg-${type.border}-500`}></span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-mono text-gray-500">
                                                    STANDBY
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-50 transition-colors">
                                            {type.title}
                                        </h3>
                                        <div className={`text-[10px] font-mono mb-4 text-${type.border}-400/80 uppercase tracking-wider`}>
                                            {type.subtitle}
                                        </div>

                                        <p className="text-sm text-gray-400 mb-6 min-h-[40px]">
                                            {type.description}
                                        </p>

                                        {/* Features List */}
                                        <div className="space-y-2 mb-6">
                                            {type.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                                    <CheckCircle className={`w-3 h-3 text-${type.border}-500/50`} />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex gap-4 text-xs font-mono text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> {type.duration}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5" /> {type.difficulty}
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-${type.border}-400`} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Launch Overlay Button (Fixed Bottom) */}
                <AnimatePresence>
                    {selectedInterviewType && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none"
                        >
                            <div className="pointer-events-auto">
                                <Button
                                    size="lg"
                                    onClick={() => handleLaunch(selectedInterviewType)}
                                    className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.3)] border border-white/50 text-base font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
                                >
                                    {launching ? (
                                        <span className="flex items-center gap-2">
                                            INITIALIZING... <Zap className="w-4 h-4 animate-pulse" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            INITIALIZE PROTOCOL <Play className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

// Simple visual components
const DnaIcon = () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 15c6.667-6 13.333 0 20-6" />
        <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
        <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        <path d="M17 6l-2.5-2.5" />
        <path d="M14 8l-1-1" />
        <path d="M7 18l2.5 2.5" />
        <path d="M3.5 14.5l-1 1" />
        <path d="M20.5 9.5l1 1" />
        <path d="M14 16l1 1" />
        <path d="M8 6l1 1" />
    </svg>
);

export default Interview;
