import { motion } from "framer-motion";
import {
    Trophy,
    RotateCcw,
    ChevronRight,
    Target,
    Zap,
    Brain,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";

interface TopicAnalysis {
    topic: string;
    attempts: number;
    strength: "Weak" | "Average" | "Strong" | "Not Assessed";
    score: number;
    tested?: boolean;
}

interface InterviewReportProps {
    report: {
        summary: {
            totalQuestions: number;
            averageScore: number;
            difficultyReached: string;
            performanceLevel: string;
        };
        topicAnalysis: TopicAnalysis[];
        recruiterInsights: string[];
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        finalVerdict: string;
        skills?: string[];
    };
    onRestart: () => void;
    onDashboard: () => void;
}

// Color palette for charts
const CHART_COLORS = {
    strong: "#10B981",    // Emerald
    average: "#F59E0B",   // Amber
    weak: "#EF4444",      // Red
    primary: "#8B5CF6",   // Violet
    secondary: "#06B6D4", // Cyan
};

export const InterviewReport = ({ report, onRestart, onDashboard }: InterviewReportProps) => {
    // Determine verdict color
    const getVerdictColor = (verdict: string) => {
        if (verdict?.toLowerCase().includes("ready") || verdict?.toLowerCase().includes("hire")) return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10";
        if (verdict?.toLowerCase().includes("improvement")) return "text-amber-400 border-amber-500/50 bg-amber-500/10";
        return "text-red-400 border-red-500/50 bg-red-500/10";
    };

    // Safely get topicAnalysis with defaults
    const safeTopicAnalysis: TopicAnalysis[] = (report.topicAnalysis || []).map(topic => ({
        topic: topic.topic || "Unknown",
        attempts: topic.attempts || 0,
        strength: topic.strength || "Average",
        score: typeof topic.score === 'number' ? topic.score : (report.summary?.averageScore || 5),
        tested: topic.tested !== false // Default to true if not specified
    }));

    // Separate tested and untested topics for better visualization
    const testedTopics = safeTopicAnalysis.filter(t => t.tested !== false && t.score > 0);
    const untestedTopics = safeTopicAnalysis.filter(t => t.tested === false || t.score === 0);

    // Prepare data for Radar Chart - Show ALL skills (tested get actual scores, untested get minimal visibility)
    let radarData = safeTopicAnalysis.map((topic) => ({
        topic: topic.topic.length > 12 ? topic.topic.slice(0, 10) + "..." : topic.topic,
        fullName: topic.topic,
        score: topic.tested !== false && topic.score > 0 ? topic.score : 0.5, // Minimal score for untested
        max: 10,
        tested: topic.tested !== false && topic.score > 0
    }));

    // Ensure minimum 3 data points for radar chart (recharts requirement)
    if (radarData.length > 0 && radarData.length < 3) {
        const fillers = ["Problem Solving", "Communication", "Design"][radarData.length - 1]
            ? ["Problem Solving", "Communication", "Design"].slice(radarData.length - 1)
            : ["Topic 1", "Topic 2", "Topic 3"].slice(radarData.length - 1);

        while (radarData.length < 3) {
            const filler = fillers.shift() || `Topic ${radarData.length + 1}`;
            radarData.push({
                topic: filler,
                fullName: filler,
                score: 0.5,
                max: 10,
                tested: false
            });
        }
    }

    // Prepare data for Bar Chart - Show ALL topics (tested and untested)
    const barData = safeTopicAnalysis.map((topic) => {
        const isTested = topic.tested !== false && topic.score > 0;
        return {
            name: topic.topic.length > 8 ? topic.topic.slice(0, 6) + "..." : topic.topic,
            fullName: topic.topic,
            score: topic.score,
            strength: topic.strength,
            attempts: topic.attempts,
            tested: isTested,
            fill: !isTested ? "#4A4A4A" : // Dark gray for untested
                topic.strength === "Strong" ? CHART_COLORS.strong :
                    topic.strength === "Weak" ? CHART_COLORS.weak :
                        CHART_COLORS.average,
        };
    });

    // Check if we have enough data for charts
    const hasChartData = safeTopicAnalysis.length > 0;
    const hasRadarData = radarData.length >= 3;

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isTested = data.tested !== false;
            return (
                <div className="bg-[#1A1A23] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">{data.fullName || data.name}</p>
                    <p className="text-cyan-400 text-sm">Score: {data.score}/10</p>
                    {data.attempts !== undefined && (
                        <p className="text-gray-400 text-xs">
                            {isTested ? `${data.attempts} questions` : 'Not assessed'}
                        </p>
                    )}
                    {!isTested && (
                        <p className="text-yellow-400 text-xs mt-1">⚠ Not tested in interview</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center relative"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                    Interview Analysis
                </h1>

                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border ${getVerdictColor(report.finalVerdict)}`}>
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-lg font-bold tracking-wide uppercase">{report.finalVerdict}</span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Overall Score", value: report.summary.averageScore.toFixed(1) + "/10", icon: Target, color: "text-cyan-400" },
                    { label: "Questions", value: report.summary.totalQuestions, icon: BookOpen, color: "text-blue-400" },
                    { label: "Difficulty", value: report.summary.difficultyReached, icon: TrendingUp, color: "text-purple-400" },
                    { label: "Level", value: report.summary.performanceLevel, icon: Brain, color: "text-pink-400" }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-card/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center hover:bg-card/20 transition-colors"
                    >
                        <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            {hasChartData && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Radar Chart - Skill Performance */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-[#1A1A23] to-[#0F0F16] border border-violet-500/20 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Skill Radar</h3>
                                <p className="text-xs text-gray-400">Performance across topics</p>
                            </div>
                        </div>
                        <div className="h-[280px] min-h-[280px]">
                            {hasRadarData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                        <PolarGrid
                                            stroke="rgba(139, 92, 246, 0.2)"
                                            strokeDasharray="3 3"
                                        />
                                        <PolarAngleAxis
                                            dataKey="topic"
                                            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
                                            tickLine={false}
                                        />
                                        <PolarRadiusAxis
                                            angle={30}
                                            domain={[0, 10]}
                                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                                            axisLine={false}
                                        />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke={CHART_COLORS.primary}
                                            fill={CHART_COLORS.primary}
                                            fillOpacity={0.4}
                                            strokeWidth={2}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Target className="w-12 h-12 text-gray-600 mb-3" />
                                    <p className="text-gray-400 text-sm">Need at least 3 topics for radar chart</p>
                                    <p className="text-gray-500 text-xs">Check the bar chart for your scores</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Bar Chart - Topic Scores */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-[#1A1A23] to-[#0F0F16] border border-cyan-500/20 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Topic Breakdown</h3>
                                <p className="text-xs text-gray-400">Score by topic area</p>
                            </div>
                        </div>
                        <div className="h-[280px] min-h-[280px]">
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={barData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
                                    >
                                        <XAxis
                                            type="number"
                                            domain={[0, 10]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                                            width={55}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="score"
                                            radius={[0, 6, 6, 0]}
                                            barSize={20}
                                        >
                                            {barData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <TrendingUp className="w-12 h-12 text-gray-600 mb-3" />
                                    <p className="text-gray-400 text-sm">No topic data available</p>
                                </div>
                            )}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.strong }} />
                                <span className="text-xs text-gray-400">Strong</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.average }} />
                                <span className="text-xs text-gray-400">Average</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.weak }} />
                                <span className="text-xs text-gray-400">Weak</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#4A4A4A]" />
                                <span className="text-xs text-gray-400">Not Assessed</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}


            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Recruiter Feedback & Topic Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recruiter Insights */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-[#1A1A23] to-[#0F0F16] border border-violet-500/20 rounded-2xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                                <Brain className="w-6 h-6 text-violet-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Recruiter Insights</h3>
                                <p className="text-sm text-violet-300/60">AI Analysis of your performance</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {report.recruiterInsights.map((insight, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                                    <div className="w-1 h-full bg-violet-500/50 rounded-full shrink-0" />
                                    <p className="text-gray-300 leading-relaxed italic">"{insight}"</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Topic Deep Dive - Now with progress bars as secondary view */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/10 border border-white/10 rounded-2xl p-8"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-cyan-400" />
                            Topic Details
                        </h3>

                        <div className="space-y-6">
                            {safeTopicAnalysis.length > 0 ? safeTopicAnalysis.map((topic, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-white">{topic.topic}</span>
                                        <span className={`px-2 py-0.5 rounded textxs font-bold ${topic.strength === "Strong" ? "text-emerald-400 bg-emerald-500/10" :
                                            topic.strength === "Weak" ? "text-red-400 bg-red-500/10" :
                                                "text-yellow-400 bg-yellow-500/10"
                                            }`}>{topic.strength}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${topic.strength === "Strong" ? "bg-emerald-500" :
                                                topic.strength === "Weak" ? "bg-red-500" : "bg-yellow-500"
                                                }`}
                                            style={{ width: `${Math.min(100, (topic.score / 10) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">
                                        {topic.attempts} Questions Attempted
                                    </p>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-center py-4">No topic data available</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Strengths & Weaknesses */}
                <div className="space-y-6">
                    {/* Strengths */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6"
                    >
                        <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Key Strengths
                        </h4>
                        <ul className="space-y-3">
                            {report.strengths.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6"
                    >
                        <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-3">
                            {report.weaknesses.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6"
                    >
                        <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Action Plan
                        </h4>
                        <ul className="space-y-3">
                            {report.recommendations.map((item, i) => (
                                <li key={i} className="text-sm text-gray-300 bg-blue-500/10 p-3 rounded-lg border border-blue-500/10">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-8">
                <Button
                    variant="outline"
                    className="h-12 px-8 border-white/10 hover:bg-white/5"
                    onClick={onRestart}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Session
                </Button>
                <Button
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-500 text-white"
                    onClick={onDashboard}
                >
                    Back to Dashboard
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

