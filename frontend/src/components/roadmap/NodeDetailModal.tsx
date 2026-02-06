import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ExternalLink, BookOpen, Code, GraduationCap, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { RoadmapNode } from '@/data/roadmapData';
import { TechLogo } from './TechLogo';
import { Button } from '@/components/ui/button';

interface NodeDetailModalProps {
    node: RoadmapNode | null;
    isOpen: boolean;
    onClose: () => void;
    pathColor: string;
}

const RESOURCE_ICONS = {
    documentation: BookOpen,
    tutorial: GraduationCap,
    course: Play,
    practice: Code,
};

const RESOURCE_COLORS = {
    documentation: 'text-blue-400',
    tutorial: 'text-emerald-400',
    course: 'text-violet-400',
    practice: 'text-amber-400',
};

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
    node,
    isOpen,
    onClose,
    pathColor,
}) => {
    if (!node) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full md:max-w-xl z-50"
                    >
                        <div className="relative max-h-[75vh] overflow-y-auto bg-[#0a0a0f] rounded-2xl border border-white/[0.08] shadow-2xl">
                            {/* Header Background */}
                            <div
                                className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                                style={{
                                    background: `linear-gradient(135deg, ${pathColor}15, transparent 70%)`,
                                }}
                            />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all z-10 group"
                            >
                                <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            </button>

                            {/* Content */}
                            <div className="relative p-6 md:p-8">
                                {/* Icon & Title */}
                                <div className="flex items-start gap-5 mb-8">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${pathColor}25, ${pathColor}10)`,
                                            boxShadow: `0 0 40px ${pathColor}20`,
                                        }}
                                    >
                                        <TechLogo icon={node.icon} size={40} />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <motion.h2
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-2xl md:text-3xl font-bold text-white mb-2"
                                        >
                                            {node.title}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-gray-400 text-sm md:text-base"
                                        >
                                            {node.description}
                                        </motion.p>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">{node.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">{node.topics.length} topics</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">{node.resources.length} resources</span>
                                    </div>
                                </motion.div>

                                {/* Topics */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-8"
                                >
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                        Topics You'll Learn
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {node.topics.map((topic, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.35 + i * 0.03 }}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-gray-300 border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-default"
                                            >
                                                {topic}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Resources */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-8"
                                >
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                        Learning Resources
                                    </h3>
                                    <div className="space-y-3">
                                        {node.resources.map((resource, i) => {
                                            const Icon = RESOURCE_ICONS[resource.type];
                                            const colorClass = RESOURCE_COLORS[resource.type];
                                            return (
                                                <motion.a
                                                    key={i}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.45 + i * 0.08 }}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 transition-all group"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center ${colorClass}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors truncate">
                                                            {resource.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 capitalize mt-0.5">
                                                            {resource.type}
                                                        </p>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                                                </motion.a>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Action Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        className="w-full h-12 text-base font-medium rounded-xl border-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${pathColor}, ${pathColor}CC)`,
                                        }}
                                    >
                                        Start Learning
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NodeDetailModal;
