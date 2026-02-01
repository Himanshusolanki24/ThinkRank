import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { NeuralBackground } from "@/components/NeuralBackground";
import {
    Github,
    FileText,
    Upload,
    ArrowRight,
    Sparkles,
    Dna,
    Check,
    X,
    Loader2,
    ChevronRight,
    Zap,
    Target,
    Brain,
    RefreshCw,
} from "lucide-react";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";

type InputMode = "github" | "resume";

interface Skill {
    name: string;
    color: string;
    textColor: string;
    category: string;
    frequency: number;
    proficiency: string;
}

interface ExtractionResult {
    skills: Skill[];
    repoCount?: number;
    username?: string;
    filename?: string;
}

const BuildGenome = () => {
    const [inputMode, setInputMode] = useState<InputMode>("github");
    const [githubUsername, setGithubUsername] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [extractedSkills, setExtractedSkills] = useState<ExtractionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleGithubValidation = async (username: string) => {
        if (!username) {
            setIsValid(null);
            return;
        }
        setIsValidating(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsValid(username.length >= 2);
        setIsValidating(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
            setResumeFile(file);
            setExtractedSkills(null);
            setError(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
            setExtractedSkills(null);
            setError(null);
        }
    };

    // Simulate loading progress
    const runLoadingAnimation = () => {
        return new Promise<void>((resolve) => {
            setLoadingProgress(0);
            const duration = 3000; // 3 seconds
            const interval = 50;
            const steps = duration / interval;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                const progress = Math.min((currentStep / steps) * 100, 100);
                setLoadingProgress(progress);

                if (currentStep >= steps) {
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        });
    };

    // Extract skills from GitHub
    const extractGitHubSkills = async () => {
        setIsLoading(true);
        setError(null);
        setExtractedSkills(null);

        try {
            // Start loading animation
            const loadingPromise = runLoadingAnimation();

            // Fetch skills from API
            const response = await fetch(`${API_BASE_URL}/api/github/skills`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: githubUsername }),
            });

            const data = await parseApiResponse(response);

            // Wait for loading animation to complete
            await loadingPromise;

            if (!data.success) {
                throw new Error(data.error || "Failed to extract skills");
            }

            setExtractedSkills(data.data);
        } catch (err: any) {
            setError(err.message || "Failed to extract skills from GitHub");
        } finally {
            setIsLoading(false);
        }
    };

    // Extract skills from Resume
    const extractResumeSkills = async () => {
        if (!resumeFile) return;

        setIsLoading(true);
        setError(null);
        setExtractedSkills(null);

        try {
            // Start loading animation
            const loadingPromise = runLoadingAnimation();

            // Upload resume and extract skills
            const formData = new FormData();
            formData.append("resume", resumeFile);

            const response = await fetch(`${API_BASE_URL}/api/resume/skills`, {
                method: "POST",
                body: formData,
            });

            const data = await parseApiResponse(response);

            // Wait for loading animation to complete
            await loadingPromise;

            if (!data.success) {
                throw new Error(data.error || "Failed to extract skills");
            }

            setExtractedSkills(data.data);
        } catch (err: any) {
            setError(err.message || "Failed to extract skills from resume");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (inputMode === "github" && isValid) {
            extractGitHubSkills();
        } else if (inputMode === "resume" && resumeFile) {
            extractResumeSkills();
        }
    };

    const handleProceed = () => {
        // Store skills in localStorage for interview page
        if (extractedSkills) {
            localStorage.setItem("extractedSkills", JSON.stringify(extractedSkills));
        }
        navigate("/interview");
    };

    const handleReset = () => {
        setExtractedSkills(null);
        setError(null);
        setGithubUsername("");
        setResumeFile(null);
        setIsValid(null);
    };

    const canSubmit =
        !isLoading &&
        !extractedSkills &&
        ((inputMode === "github" && isValid) || (inputMode === "resume" && resumeFile));

    return (
        <div className="min-h-screen bg-background">
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12">
                <NeuralBackground />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
                />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-4xl mx-auto mb-12"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Skill Analysis</span>
                        </motion.div>

                        <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                            Build Your{" "}
                            <span className="text-gradient-pink">Skill Genome</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Connect your GitHub profile or upload your resume to unlock
                            AI-powered skill analysis and personalized growth recommendations.
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-2xl mx-auto"
                    >
                        {/* Glassmorphism Card with Animated Border */}
                        <div className="relative group">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-primary/50 to-primary rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition duration-500" />
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-primary/50 to-primary rounded-2xl opacity-50 animate-pulse" />

                            <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 p-8 md:p-10">
                                <AnimatePresence mode="wait">
                                    {/* Loading State */}
                                    {isLoading && (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="text-center py-12"
                                        >
                                            {/* DNA Helix Animation */}
                                            <div className="relative w-24 h-24 mx-auto mb-8">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0"
                                                >
                                                    <Dna className="w-24 h-24 text-primary" />
                                                </motion.div>
                                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                            </div>

                                            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                                Analyzing Your Skills...
                                            </h3>
                                            <p className="text-muted-foreground mb-6">
                                                {inputMode === "github"
                                                    ? `Scanning ${githubUsername}'s repositories`
                                                    : "Parsing your resume"}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="w-full max-w-xs mx-auto">
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${loadingProgress}%` }}
                                                        transition={{ duration: 0.1 }}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {Math.round(loadingProgress)}%
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Results State */}
                                    {!isLoading && extractedSkills && (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                        >
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                    <Check className="w-8 h-8 text-green-500" />
                                                </div>
                                                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                                                    Skills Extracted!
                                                </h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {extractedSkills.repoCount
                                                        ? `Found ${extractedSkills.skills.length} skills from ${extractedSkills.repoCount} repositories`
                                                        : `Found ${extractedSkills.skills.length} skills from your resume`}
                                                </p>
                                            </div>

                                            {/* Skills Grid */}
                                            <div className="flex flex-wrap gap-2 justify-center mb-8">
                                                {extractedSkills.skills.slice(0, 20).map((skill, index) => (
                                                    <motion.div
                                                        key={skill.name}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group relative"
                                                    >
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105 cursor-default"
                                                            style={{
                                                                backgroundColor: skill.color,
                                                                color: skill.textColor,
                                                            }}
                                                        >
                                                            {skill.name}
                                                            <span
                                                                className="text-xs opacity-70"
                                                                style={{ color: skill.textColor }}
                                                            >
                                                                {skill.frequency}x
                                                            </span>
                                                        </span>
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                            {skill.proficiency}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {extractedSkills.skills.length > 20 && (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                                                        +{extractedSkills.skills.length - 20} more
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button
                                                    variant="genome-outline"
                                                    size="lg"
                                                    className="flex-1"
                                                    onClick={handleReset}
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Start Over
                                                </Button>
                                                <Button
                                                    variant="genome"
                                                    size="lg"
                                                    className="flex-1 group"
                                                    onClick={handleProceed}
                                                >
                                                    <Dna className="w-5 h-5" />
                                                    Go to Interview Page
                                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error State */}
                                    {!isLoading && error && (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-8"
                                        >
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                                <X className="w-8 h-8 text-red-500" />
                                            </div>
                                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                                Extraction Failed
                                            </h3>
                                            <p className="text-red-400 text-sm mb-6">{error}</p>
                                            <Button variant="genome-outline" onClick={handleReset}>
                                                <RefreshCw className="w-4 h-4" />
                                                Try Again
                                            </Button>
                                        </motion.div>
                                    )}

                                    {/* Input State */}
                                    {!isLoading && !extractedSkills && !error && (
                                        <motion.div
                                            key="input"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {/* Mode Toggle */}
                                            <div className="flex justify-center mb-8">
                                                <div className="inline-flex bg-background/50 rounded-xl p-1.5 border border-border">
                                                    <button
                                                        onClick={() => {
                                                            setInputMode("github");
                                                            setError(null);
                                                        }}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${inputMode === "github"
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                            : "text-muted-foreground hover:text-foreground"
                                                            }`}
                                                    >
                                                        <Github className="w-5 h-5" />
                                                        GitHub
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setInputMode("resume");
                                                            setError(null);
                                                        }}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${inputMode === "resume"
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                            : "text-muted-foreground hover:text-foreground"
                                                            }`}
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                        Resume
                                                    </button>
                                                </div>
                                            </div>

                                            {inputMode === "github" ? (
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-3">
                                                        GitHub Username
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                            <Github className="w-5 h-5" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={githubUsername}
                                                            onChange={(e) => {
                                                                setGithubUsername(e.target.value);
                                                                handleGithubValidation(e.target.value);
                                                            }}
                                                            placeholder="Enter your GitHub username"
                                                            className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            {isValidating && (
                                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                                            )}
                                                            {!isValidating && isValid === true && (
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            )}
                                                            {!isValidating && isValid === false && (
                                                                <X className="w-5 h-5 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-sm text-muted-foreground">
                                                        We'll analyze your public repositories to extract your skills
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-3">
                                                        Upload Resume
                                                    </label>
                                                    <div
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                                                            ? "border-primary bg-primary/10"
                                                            : resumeFile
                                                                ? "border-green-500/50 bg-green-500/5"
                                                                : "border-border hover:border-primary/50 hover:bg-primary/5"
                                                            }`}
                                                    >
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                        />

                                                        {resumeFile ? (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                                    <Check className="w-7 h-7 text-green-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">
                                                                        {resumeFile.name}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {(resumeFile.size / 1024).toFixed(1)} KB
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setResumeFile(null);
                                                                    }}
                                                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                                                >
                                                                    Remove file
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <motion.div
                                                                    animate={{ y: isDragging ? -5 : 0 }}
                                                                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                                                                >
                                                                    <Upload className="w-7 h-7 text-primary" />
                                                                </motion.div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">
                                                                        Drop your resume here
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        or click to browse (PDF only)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="mt-8"
                                            >
                                                <Button
                                                    variant="genome"
                                                    size="xl"
                                                    className="w-full group"
                                                    disabled={!canSubmit}
                                                    onClick={handleSubmit}
                                                >
                                                    <Dna className="w-5 h-5" />
                                                    Generate My Skill Genome
                                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </motion.div>

                                            {/* Features List */}
                                            <div className="mt-8 pt-6 border-t border-border">
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        { icon: Zap, label: "Instant Analysis" },
                                                        { icon: Target, label: "Gap Detection" },
                                                        { icon: Brain, label: "AI Insights" },
                                                    ].map((feature) => (
                                                        <div
                                                            key={feature.label}
                                                            className="flex flex-col items-center gap-2 text-center"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <feature.icon className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {feature.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* How It Works Link */}
                    {!isLoading && !extractedSkills && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center mt-8"
                        >
                            <Link
                                to="/how-it-works"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <span>Learn how it works</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BuildGenome;
