import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
import { Briefcase, Upload, CheckCircle2, XCircle, AlertCircle, Sparkles, Target, ArrowRight } from "lucide-react";

// Circular progress for match percentage
const CircularProgress = ({
    value,
    size = 180,
}: {
    value: number;
    size?: number;
}) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    let color = "#10B981"; // Emerald
    if (value < 50) color = "#EF4444"; // Red
    else if (value < 75) color = "#F59E0B"; // Amber

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{value}%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        Match
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function JobAnalyzer() {
    const { profile } = useAuth();
    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        matchPercentage: number;
        recommendation: string;
        reasoning: string;
        matchingSkills: string[];
        missingSkills: string[];
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;

        setIsAnalyzing(true);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append("jobDescription", jobDescription);
            
            // Pass profile skills if available
            if (profile?.skills) {
                formData.append("skills", JSON.stringify(profile.skills));
            }

            if (resumeFile) {
                formData.append("resume", resumeFile);
            }

            const response = await fetch(`${API_BASE_URL}/api/recruitos/match-jd`, {
                method: "POST",
                body: formData,
            });

            const result = await parseApiResponse(response);
            if (result.success && result.data) {
                setResults(result.data);
            }
        } catch (error) {
            console.error("Error analyzing JD:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRecommendationColor = (rec: string) => {
        if (rec === "HIRE" || rec === "HIGHLY RECOMMENDED") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (rec === "MAYBE" || rec === "RECOMMENDED") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-red-400 bg-red-500/10 border-red-500/20";
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 pt-12 pb-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                            <Target className="w-4 h-4 text-violet-400" />
                            <span className="text-sm font-medium text-violet-400">
                                AI Job Analyzer
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Match your <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Resume</span> to any JD
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Paste a Job Description and see how well you match. We'll compare it against your profile skills or uploaded resume to give you actionable insights.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-2xl bg-[#12121A] border border-white/10 flex flex-col"
                        >
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-violet-400" />
                                Job Description
                            </h2>
                            <Textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="flex-1 min-h-[300px] bg-white/5 border-white/10 resize-none focus:border-violet-500/50 mb-6"
                            />

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Optional: Upload Resume PDF for better analysis
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-300">
                                            {resumeFile ? resumeFile.name : "Select PDF File"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {resumeFile && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setResumeFile(null)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                {!resumeFile && profile?.skills && (
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-violet-400" />
                                        Will use your {profile.skills.length} profile skills if no resume is uploaded.
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={!jobDescription.trim() || isAnalyzing}
                                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-lg font-medium"
                            >
                                {isAnalyzing ? "Analyzing Match..." : "Analyze Match"}
                                {!isAnalyzing && <ArrowRight className="w-5 h-5 ml-2" />}
                            </Button>
                        </motion.div>

                        {/* Results Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-[#12121A] border border-white/10 relative overflow-hidden"
                        >
                            {!results && !isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#12121A]/80 backdrop-blur-sm z-10">
                                    <Target className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                                    <p className="text-gray-400 font-medium">Awaiting Job Description</p>
                                    <p className="text-sm text-gray-500 mt-2">Paste a JD and click Analyze to see your match percentage and skills gap.</p>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#12121A]/90 backdrop-blur-md z-20">
                                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                                    <p className="text-violet-400 font-medium animate-pulse">Running AI Analysis...</p>
                                </div>
                            )}

                            <AnimatePresence>
                                {results && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col"
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-white/10">
                                            <CircularProgress value={results.matchPercentage} />
                                            <div className="flex-1 text-center md:text-left">
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-full border mb-4 text-sm font-bold tracking-wide ${getRecommendationColor(results.recommendation)}`}>
                                                    {results.recommendation}
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {results.reasoning}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6 flex-1">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Matching Skills
                                                </h3>
                                                <ul className="space-y-2">
                                                    {results.matchingSkills?.length > 0 ? results.matchingSkills.map((skill, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            {skill}
                                                        </li>
                                                    )) : (
                                                        <p className="text-sm text-gray-500 italic">No exact matches found.</p>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-red-400 flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5" />
                                                    Missing Skills
                                                </h3>
                                                <ul className="space-y-2">
                                                    {results.missingSkills?.length > 0 ? results.missingSkills.map((skill, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                            {skill}
                                                        </li>
                                                    )) : (
                                                        <p className="text-sm text-emerald-500 italic">No missing skills detected!</p>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
