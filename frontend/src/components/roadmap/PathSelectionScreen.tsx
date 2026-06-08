import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Globe, BrainCircuit, Server, Database, ChevronRight, Sparkles, Users, Clock, Star } from 'lucide-react';
import { LearningPath, getNodeProgress } from '@/data/roadmapData';

interface PathSelectionScreenProps {
    paths: LearningPath[];
    onSelectPath: (path: LearningPath) => void;
}

const PATH_ICONS: Record<string, React.ReactNode> = {
    'web-development': <Globe className="w-8 h-8" />,
    'basic-programming': <Code2 className="w-8 h-8" />,
    'dsa': <BrainCircuit className="w-8 h-8" />,
    'system-design': <Server className="w-8 h-8" />,
    'data-science': <Database className="w-8 h-8" />,
    'ai-ml-engineering': <BrainCircuit className="w-8 h-8" />,
    'generative-ai': <Sparkles className="w-8 h-8" />,
};

const PATH_STATS: Record<string, { learners: string; rating: number }> = {
    'web-development': { learners: '125K+', rating: 4.9 },
    'basic-programming': { learners: '200K+', rating: 4.8 },
    'dsa': { learners: '180K+', rating: 4.9 },
    'system-design': { learners: '85K+', rating: 4.7 },
    'data-science': { learners: '95K+', rating: 4.8 },
    'ai-ml-engineering': { learners: '45K+', rating: 4.8 },
    'generative-ai': { learners: '65K+', rating: 4.9 },
};

export const PathSelectionScreen: React.FC<PathSelectionScreenProps> = ({
    paths,
    onSelectPath,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-8"
        >
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-16 relative z-10"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6"
                >
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-violet-300">Begin Your Journey</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    Choose Your{' '}
                    <span className="relative">
                        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Path
                        </span>
                        <motion.span
                            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        />
                    </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Curated learning paths with resources from industry-leading platforms.
                    <br className="hidden md:block" />
                    Master skills at your own pace with structured milestones.
                </p>
            </motion.div>

            {/* Path Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
                {paths.map((path, index) => {
                    const stats = PATH_STATS[path.id] || { learners: '10K+', rating: 4.5 };
                    const progress = getNodeProgress(path.nodes);

                    return (
                        <motion.div
                            key={path.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.1 + 0.3,
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectPath(path)}
                            className="group relative cursor-pointer"
                        >
                            {/* Card Glow */}
                            <div
                                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"
                                style={{
                                    background: `linear-gradient(135deg, ${path.gradientFrom}, ${path.gradientTo})`,
                                }}
                            />

                            {/* Card */}
                            <div className="relative h-full p-6 rounded-2xl bg-[#0f0f14] border border-white/[0.08] overflow-hidden group-hover:border-white/20 transition-all duration-300">
                                {/* Subtle gradient overlay */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, ${path.gradientFrom}08, ${path.gradientTo}08)`,
                                    }}
                                />

                                {/* Top Section */}
                                <div className="relative flex items-start justify-between mb-6">
                                    {/* Icon Container */}
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${path.gradientFrom}20, ${path.gradientTo}15)`,
                                            boxShadow: `0 0 30px ${path.gradientFrom}15`,
                                        }}
                                    >
                                        <div style={{ color: path.color }}>
                                            {PATH_ICONS[path.id]}
                                        </div>
                                    </div>

                                    {/* Milestones Badge */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                        <span className="text-xs font-medium text-gray-400">
                                            {path.nodes.length} milestones
                                        </span>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors">
                                    {path.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 group-hover:text-gray-400 transition-colors">
                                    {path.description}
                                </p>

                                {/* Stats Row */}
                                <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{stats.learners} learners</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span>{stats.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Self-paced</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-6 h-6 rounded-full border-2 border-[#0f0f14]"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${path.gradientFrom}${40 + i * 20}, ${path.gradientTo}${40 + i * 20})`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                                            Popular
                                        </span>
                                    </div>

                                    <motion.div
                                        className="flex items-center gap-1 text-sm font-medium"
                                        style={{ color: path.color }}
                                        whileHover={{ x: 3 }}
                                    >
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Start
                                        </span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </motion.div>
                                </div>

                                {/* Source Tag */}
                                <div className="absolute bottom-0 left-0 right-0 py-2 px-4 text-[9px] text-gray-600 bg-gradient-to-t from-black/20 to-transparent">
                                    Powered by {path.source.split(',')[0]}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Trust Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-16 text-center relative z-10"
            >
                <p className="text-xs text-gray-600 mb-4 uppercase tracking-widest">
                    Trusted sources for learning content
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
                    {['MDN Web Docs', 'freeCodeCamp', 'LeetCode', 'Kaggle', 'ByteByteGo'].map((source, i) => (
                        <motion.span
                            key={source}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 + i * 0.1 }}
                            className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-xs"
                        >
                            {source}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PathSelectionScreen;
