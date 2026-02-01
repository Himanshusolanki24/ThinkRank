import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    Clock,
    Star,
    Sparkles,
    CheckCircle,
    Loader2,
    Trophy,
    Send,
    Flame,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";

interface Task {
    id: string;
    technology: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    question: string;
    hint: string;
    xp_reward: number;
    expected_time_minutes: number;
}

const difficultyColors = {
    beginner: "bg-skill-beginner/10 text-skill-beginner border-skill-beginner/30",
    intermediate: "bg-skill-intermediate/10 text-skill-intermediate border-skill-intermediate/30",
    advanced: "bg-skill-advanced/10 text-skill-advanced border-skill-advanced/30",
};

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [task, setTask] = useState<Task | null>(null);
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [streakData, setStreakData] = useState<{ currentStreak: number; isFirstActivityToday: boolean } | null>(null);
    const [validationResult, setValidationResult] = useState<{
        isCorrect: boolean;
        score: number;
        feedback: string;
        strengths: string;
        improvements: string;
    } | null>(null);

    useEffect(() => {
        // Get task from localStorage (passed from Tasks page)
        const storedTask = localStorage.getItem("currentTask");
        if (storedTask) {
            const parsedTask = JSON.parse(storedTask);
            setTask(parsedTask);

            // Check if already completed
            const completedTasks = JSON.parse(localStorage.getItem("completedTasks") || "[]");
            setIsCompleted(completedTasks.includes(parsedTask.id));
        }
        setIsLoading(false);
    }, [taskId]);

    const handleSubmit = async () => {
        if (!answer.trim()) {
            toast({
                title: "Please write your answer",
                description: "You need to provide an answer before submitting.",
                variant: "destructive",
            });
            return;
        }

        if (!user?.id || !task) {
            toast({
                title: "Error",
                description: "Please log in to submit answers.",
                variant: "destructive",
            });
            return;
        }

        setIsValidating(true);
        setValidationResult(null);

        try {
            // Step 1: Validate the answer using Mistral AI
            const validateResponse = await fetch(`${API_BASE_URL}/api/daily-tasks/validate-answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: task.id,
                    userId: user.id,
                    answer: answer,
                    question: task.question,
                    technology: task.technology,
                }),
            });

            const validateData = await parseApiResponse(validateResponse);

            if (!validateData.success) {
                toast({
                    title: "Validation Error",
                    description: validateData.error || "Failed to validate answer.",
                    variant: "destructive",
                });
                setIsValidating(false);
                return;
            }

            setValidationResult(validateData);

            // Step 2: If answer is NOT correct, show feedback and stop
            if (!validateData.isCorrect) {
                toast({
                    title: `Score: ${validateData.score}/10 - Try Again!`,
                    description: "Your answer needs improvement. Check the feedback below.",
                    variant: "destructive",
                });
                setIsValidating(false);
                return;
            }

            // Step 3: Answer is correct! Mark task as complete
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/daily-tasks/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    taskId: task.id,
                    xpEarned: task.xp_reward,
                }),
            });

            const data = await parseApiResponse(response);

            if (data.success) {
                // Save to localStorage
                const completedTasks = JSON.parse(localStorage.getItem("completedTasks") || "[]");
                if (!completedTasks.includes(task.id)) {
                    completedTasks.push(task.id);
                    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
                }

                // Update streak
                try {
                    const streakResponse = await fetch(`${API_BASE_URL}/api/daily-tasks/update-streak`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id,
                            activityType: "task_completed",
                            xpEarned: task.xp_reward,
                        }),
                    });
                    const streakResult = await parseApiResponse(streakResponse);
                    if (streakResult.success) {
                        setStreakData(streakResult.data);
                    }
                } catch (streakError) {
                    console.error("Error updating streak:", streakError);
                }

                // Update skill progress for the focus area tracking
                // This allows daily task completions to show progress in dashboard's focus areas
                try {
                    await fetch(`${API_BASE_URL}/api/daily-tasks/update-skill-progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id,
                            skill: task.technology,
                            score: validateData.score,
                            xpEarned: task.xp_reward,
                        }),
                    });
                } catch (skillError) {
                    console.error("Error updating skill progress:", skillError);
                }

                setIsCompleted(true);
                setShowCelebration(true);

                toast({
                    title: `Score: ${validateData.score}/10 - Excellent! +${task.xp_reward} XP! 🎉`,
                    description: "Great job completing the task!",
                });

                // Hide celebration after 4 seconds
                setTimeout(() => {
                    setShowCelebration(false);
                }, 4000);
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            toast({
                title: "Error",
                description: "Failed to submit answer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsValidating(false);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-8 pb-12">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-muted-foreground">Task not found.</p>
                        <Button variant="genome" onClick={() => navigate("/tasks")} className="mt-4">
                            Back to Tasks
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-8 pb-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/tasks")}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tasks
                    </Button>

                    {/* Celebration Overlay */}
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                className="flex flex-col items-center text-center px-6"
                            >
                                <Trophy className="w-24 h-24 text-skill-advanced mb-4" />
                                <h2 className="text-3xl font-display font-bold text-skill-advanced mb-2">
                                    Task Complete!
                                </h2>
                                <p className="text-xl text-foreground mb-4">+{task.xp_reward} XP</p>

                                {streakData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Flame className="w-8 h-8 text-primary" />
                                            <span className="text-2xl font-display font-bold text-primary">
                                                {streakData.currentStreak} Day Streak!
                                            </span>
                                        </div>
                                        {streakData.isFirstActivityToday && (
                                            <p className="text-sm text-muted-foreground">
                                                🎉 Congrats on being active today! Keep it up!
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Task Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card variant="genome">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 rounded-lg text-sm font-medium border ${difficultyColors[task.difficulty]
                                                }`}
                                        >
                                            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                                        </span>
                                        <span className="text-muted-foreground">{task.technology}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            ~{task.expected_time_minutes} min
                                        </span>
                                        <span className="flex items-center gap-1 text-primary">
                                            <Star className="w-4 h-4" />
                                            {task.xp_reward} XP
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl">{task.question}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Hint */}
                                {task.hint && (
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                        <p className="text-sm text-muted-foreground">
                                            <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                                            <strong>Hint:</strong> {task.hint}
                                        </p>
                                    </div>
                                )}

                                {/* Answer Section */}
                                {!isCompleted ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Your Answer
                                            </label>
                                            <textarea
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                placeholder="Write your answer here... You can include code examples, explanations, or any relevant details."
                                                rows={8}
                                                className="w-full bg-background/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 resize-none font-mono text-sm"
                                            />
                                        </div>

                                        {/* Validation Feedback */}
                                        {validationResult && !validationResult.isCorrect && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                                    <span className="font-semibold text-red-400">
                                                        Score: {validationResult.score}/10 - Needs Improvement
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground">
                                                    {validationResult.feedback}
                                                </p>
                                                {validationResult.improvements && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <ThumbsDown className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                        <span className="text-muted-foreground">
                                                            <strong>Improve:</strong> {validationResult.improvements}
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        <Button
                                            variant="genome"
                                            size="lg"
                                            onClick={handleSubmit}
                                            disabled={isValidating || isSubmitting || !answer.trim()}
                                            className="w-full"
                                        >
                                            {isValidating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Checking your answer...
                                                </>
                                            ) : isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Completing task...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Submit Your Answer
                                                </>
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-16 h-16 text-skill-advanced mx-auto mb-4" />
                                        <h3 className="text-xl font-display font-bold text-foreground mb-2">
                                            Task Completed!
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            You earned {task.xp_reward} XP for this task.
                                        </p>
                                        <Button variant="genome" onClick={() => navigate("/tasks")}>
                                            Back to Tasks
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TaskDetail;
