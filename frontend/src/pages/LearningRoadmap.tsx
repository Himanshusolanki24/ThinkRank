import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Sparkles, Trophy, Flag, Zap } from 'lucide-react';
import { LEARNING_PATHS, LearningPath, RoadmapNode as RoadmapNodeType, getNodeProgress } from '@/data/roadmapData';
import { PathSelectionScreen } from '@/components/roadmap/PathSelectionScreen';
import { RoadmapNode } from '@/components/roadmap/RoadmapNode';
import { RoadmapConnector } from '@/components/roadmap/AnimatedPath';
import { NodeDetailModal } from '@/components/roadmap/NodeDetailModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type ScreenState = 'selection' | 'roadmap';

export const LearningRoadmap: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<ScreenState>('selection');
    const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
    const [selectedNode, setSelectedNode] = useState<RoadmapNodeType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectPath = useCallback((path: LearningPath) => {
        setSelectedPath(path);
        setCurrentScreen('roadmap');
    }, []);

    const handleBackToSelection = useCallback(() => {
        setCurrentScreen('selection');
        setSelectedPath(null);
    }, []);

    const handleNodeClick = useCallback((node: RoadmapNodeType) => {
        setSelectedNode(node);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedNode(null), 200);
    }, []);

    const progress = selectedPath ? getNodeProgress(selectedPath.nodes) : { completed: 0, total: 0, percentage: 0 };

    return (
        <div className="min-h-screen bg-[#08080c] overflow-x-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[150px]" />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08080c]/50 to-[#08080c]" />
            </div>

            <AnimatePresence mode="wait">
                {currentScreen === 'selection' ? (
                    <PathSelectionScreen
                        key="selection"
                        paths={LEARNING_PATHS}
                        onSelectPath={handleSelectPath}
                    />
                ) : selectedPath && (
                    <motion.div
                        key="roadmap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-screen"
                    >
                        {/* Roadmap Header */}
                        <div className="sticky top-0 z-40 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/[0.04]">
                            <div className="max-w-5xl mx-auto px-6 py-4">
                                <div className="flex items-center justify-between">
                                    {/* Back Button & Title */}
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBackToSelection}
                                            className="text-gray-500 hover:text-white hover:bg-white/5 -ml-2"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            <span className="hidden sm:inline">All Paths</span>
                                        </Button>

                                        <div className="h-6 w-px bg-white/10 hidden sm:block" />

                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, ${selectedPath.gradientFrom}30, ${selectedPath.gradientTo}20)`,
                                                }}
                                            >
                                                <MapPin className="w-4 h-4" style={{ color: selectedPath.color }} />
                                            </div>
                                            <div>
                                                <h1 className="text-lg font-semibold text-white">
                                                    {selectedPath.title}
                                                </h1>
                                                <p className="text-[10px] text-gray-600 hidden sm:block">
                                                    {selectedPath.source}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm font-medium text-white">
                                                    {progress.completed}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    / {progress.total}
                                                </span>
                                            </div>
                                            <div className="w-24">
                                                <Progress
                                                    value={progress.percentage}
                                                    className="h-1.5 bg-white/5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roadmap Content */}
                        <div className="relative max-w-5xl mx-auto px-6 py-16">
                            {/* Journey Start */}
                            <motion.div
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                                className="flex flex-col items-center mb-12"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative"
                                    style={{
                                        background: `linear-gradient(135deg, ${selectedPath.gradientFrom}, ${selectedPath.gradientTo})`,
                                        boxShadow: `0 0 50px ${selectedPath.gradientFrom}40`,
                                    }}
                                >
                                    <Flag className="w-6 h-6 text-white" />
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl"
                                        style={{ background: `linear-gradient(135deg, ${selectedPath.gradientFrom}, ${selectedPath.gradientTo})` }}
                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                </div>
                                <h2 className="text-lg font-semibold text-white mb-1">Start Your Journey</h2>
                                <p className="text-sm text-gray-500">{selectedPath.nodes.length} milestones ahead</p>
                            </motion.div>

                            {/* Nodes */}
                            <div className="relative">
                                {/* Center Line Guide */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

                                {selectedPath.nodes.map((node, index) => {
                                    const isLeft = index % 2 === 0;
                                    const isLast = index === selectedPath.nodes.length - 1;
                                    const isCompleted = node.status === 'completed';

                                    return (
                                        <div key={node.id} className="relative">
                                            {/* Node */}
                                            <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`w-full md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                                    <RoadmapNode
                                                        node={node}
                                                        index={index}
                                                        isLeft={isLeft}
                                                        pathColor={selectedPath.color}
                                                        onNodeClick={handleNodeClick}
                                                    />
                                                </div>
                                            </div>

                                            {/* Connector */}
                                            {!isLast && (
                                                <RoadmapConnector
                                                    index={index}
                                                    isCompleted={isCompleted}
                                                    pathColor={selectedPath.color}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Journey End */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: selectedPath.nodes.length * 0.12 + 0.4 }}
                                className="flex flex-col items-center mt-12"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl">
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                    <motion.div
                                        className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30"
                                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center"
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles className="w-3 h-3 text-amber-900" />
                                    </motion.div>
                                </div>
                                <h2 className="text-xl font-bold text-white mt-6 mb-2">Mastery Unlocked</h2>
                                <p className="text-sm text-gray-500 text-center max-w-xs">
                                    Complete all milestones to earn your badge and unlock advanced paths
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Node Detail Modal */}
            <NodeDetailModal
                node={selectedNode}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                pathColor={selectedPath?.color || '#8B5CF6'}
            />
        </div>
    );
};

export default LearningRoadmap;
