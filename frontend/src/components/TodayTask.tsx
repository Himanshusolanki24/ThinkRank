/**
 * Today's Task Component
 * 
 * Displays the daily recommended practice problem based on skill gaps.
 * Shows platform, topic, difficulty, and reason for recommendation.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Target,
    ExternalLink,
    RefreshCw,
    Sparkles,
    Brain,
    Zap,
    CheckCircle2,
    BookOpen,
    TrendingUp,
    Clock,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Platform logos (simple text-based for now)
const PlatformIcon = ({ platform, className = "" }: { platform: string; className?: string }) => {
    const colors: Record<string, string> = {
        LeetCode: "text-orange-500 bg-orange-500/10",
        HackerRank: "text-green-500 bg-green-500/10",
        CodeChef: "text-amber-500 bg-amber-500/10",
        Codeforces: "text-blue-500 bg-blue-500/10",
    };

    const color = colors[platform] || "text-violet-500 bg-violet-500/10";
    const initial = platform.charAt(0);

    return (
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center font-bold text-lg ${className}`}>
            {initial}
        </div>
    );
};

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
        case "easy":
            return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        case "medium":
            return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        case "hard":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
};

interface TodayTask {
    topic: string;
    platform: string;
    title: string;
    url: string;
    difficulty: string;
    tags?: string[];
    reason: string;
    explanation: string;
    skillGap?: {
        type: string;
        severity: string;
        topic: string;
    };
}

interface TodayTaskProps {
    showTitle?: boolean;
    compact?: boolean;
    className?: string;
}

export const TodayTask = ({ showTitle = true, compact = false, className = "" }: TodayTaskProps) => {
    const { user } = useAuth();
    const sounds = useSoundEffects();
    const [task, setTask] = useState<TodayTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const fetchTodayTask = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch(`${API_URL}/api/practice/today-task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?.id }),
            });

            const data = await response.json();

            if (data.success && data.data?.todayTask) {
                setTask(data.data.todayTask);
                if (isRefresh) sounds.playSuccess();
            }
        } catch (error) {
            console.error("Failed to fetch today's task:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTodayTask();
    }, [user?.id]);

    const handleOpenProblem = () => {
        sounds.playClick();
        if (task?.url) {
            window.open(task.url, "_blank");
        }
    };

    const handleRefresh = () => {
        sounds.playClick();
        fetchTodayTask(true);
    };

    const handleMarkComplete = () => {
        sounds.playSuccess();
        setCompleted(true);
        // TODO: Save to backend
    };

    if (loading) {
        return (
            <Card className={`bg-gradient-to-br from-[#1A1A23] to-[#0F0F16] border-violet-500/20 ${className}`}>
                <CardHeader>
                    <Skeleton className="h-6 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-64 bg-white/5" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5" />
                </CardContent>
            </Card>
        );
    }

    if (!task) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#1A1A23] to-[#0F0F16] border-violet-500/20">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />

                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-violet-400" />
                            {showTitle && (
                                <CardTitle className="text-lg text-white">Today's Practice</CardTitle>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-white"
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="text-gray-400">
                        AI-powered recommendation based on your skill gaps
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Problem Card */}
                    <div className={`p-4 rounded-xl border transition-all duration-300 ${completed
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/5 border-white/10 hover:border-violet-500/30"
                        }`}>
                        <div className="flex items-start gap-4">
                            <PlatformIcon platform={task.platform} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                                        {task.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/20 text-gray-400">
                                        {task.topic}
                                    </Badge>
                                </div>

                                <h3 className="font-semibold text-white text-lg truncate">
                                    {task.title}
                                </h3>

                                <p className="text-sm text-gray-400 mt-1">
                                    {task.platform}
                                </p>
                            </div>

                            {completed && (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                            )}
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && !compact && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {task.tags.slice(0, 4).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs border-white/10 text-gray-500"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    {!compact && task.explanation && (
                        <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                            <div className="flex items-start gap-2">
                                <Brain className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {task.explanation}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Skill Gap Info */}
                    {!compact && task.skillGap && (
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-violet-400" />
                                <span>Focus: {task.skillGap.topic}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="capitalize">Priority: {task.skillGap.severity}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                            onClick={handleOpenProblem}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Solve Problem
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>

                        {!completed && (
                            <Button
                                variant="outline"
                                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                                onClick={handleMarkComplete}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Done
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TodayTask;
