import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Play, Clock, ChevronRight, Zap } from 'lucide-react';
import { RoadmapNode as RoadmapNodeType } from '@/data/roadmapData';
import { TechLogo } from './TechLogo';

interface RoadmapNodeProps {
    node: RoadmapNodeType;
    index: number;
    isLeft: boolean;
    pathColor: string;
    onNodeClick: (node: RoadmapNodeType) => void;
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
    node,
    index,
    isLeft,
    pathColor,
    onNodeClick,
}) => {
    const isActive = node.status === 'active';
    const isCompleted = node.status === 'completed';
    const isLocked = node.status === 'locked';

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                delay: index * 0.12 + 0.2,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative flex items-center gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
        >
            {/* Node Circle */}
            <motion.div
                whileHover={!isLocked ? { scale: 1.05 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                onClick={() => !isLocked && onNodeClick(node)}
                className={`
          relative flex-shrink-0 cursor-${isLocked ? 'not-allowed' : 'pointer'}
        `}
            >
                {/* Outer Glow Ring for Active */}
                {isActive && (
                    <>
                        <motion.div
                            className="absolute -inset-3 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${pathColor}30 0%, transparent 70%)`,
                            }}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.2, 0.5],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute -inset-1 rounded-full border-2"
                            style={{ borderColor: `${pathColor}40` }}
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </>
                )}

                {/* Main Circle */}
                <div
                    className={`
            relative w-20 h-20 md:w-[88px] md:h-[88px] rounded-full
            flex items-center justify-center
            transition-all duration-300
            ${isLocked
                            ? 'bg-[#0f0f14] border border-white/5'
                            : isCompleted
                                ? 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-2 border-emerald-500/50'
                                : 'bg-gradient-to-br from-[#1a1a24] to-[#0f0f14] border-2'
                        }
          `}
                    style={{
                        borderColor: isActive ? pathColor : undefined,
                        boxShadow: isActive
                            ? `0 0 40px ${pathColor}30, 0 0 80px ${pathColor}15`
                            : isCompleted
                                ? '0 0 30px rgba(16, 185, 129, 0.2)'
                                : undefined,
                    }}
                >
                    {/* Inner gradient shine */}
                    {!isLocked && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
                    )}

                    {/* Tech Logo */}
                    <div className={`relative z-10 ${isLocked ? 'opacity-30 grayscale' : ''}`}>
                        <TechLogo icon={node.icon} size={isActive ? 38 : 34} />
                    </div>

                    {/* Status Badge */}
                    <div
                        className={`
              absolute -top-1 -right-1 w-7 h-7 rounded-full
              flex items-center justify-center shadow-lg
              ${isCompleted
                                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                                : isActive
                                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                    : 'bg-[#1a1a24] border border-white/10'}
            `}
                    >
                        {isCompleted ? (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        ) : isActive ? (
                            <Zap className="w-3.5 h-3.5 text-white" fill="currentColor" />
                        ) : (
                            <Lock className="w-3 h-3 text-gray-600" />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    delay: index * 0.12 + 0.35,
                    duration: 0.5,
                }}
                onClick={() => !isLocked && onNodeClick(node)}
                className={`
          relative group max-w-sm w-full cursor-${isLocked ? 'default' : 'pointer'}
        `}
            >
                {/* Card hover glow */}
                {!isLocked && (
                    <div
                        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
                        style={{
                            background: `linear-gradient(135deg, ${pathColor}40, ${pathColor}20)`,
                        }}
                    />
                )}

                <div
                    className={`
            relative p-5 rounded-xl
            bg-[#0f0f14] border border-white/[0.06]
            ${!isLocked ? 'group-hover:border-white/15 group-hover:bg-[#12121a]' : 'opacity-50'}
            transition-all duration-300
          `}
                >
                    {/* Step Number */}
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[#0f0f14] border border-white/10 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Step {index + 1}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                        {node.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 group-hover:text-gray-400 transition-colors">
                        {node.description}
                    </p>

                    {/* Meta Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{node.duration}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                            <span>{node.topics.length} topics</span>
                        </div>

                        {!isLocked && (
                            <motion.div
                                className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                                style={{ color: pathColor }}
                                whileHover={{ x: 2 }}
                            >
                                <span>{isActive ? 'Continue' : 'Preview'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </motion.div>
                        )}
                    </div>

                    {/* Topics Preview */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                        {node.topics.slice(0, 3).map((topic, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 text-[10px] rounded-md bg-white/[0.03] text-gray-500 border border-white/[0.04]"
                            >
                                {topic}
                            </span>
                        ))}
                        {node.topics.length > 3 && (
                            <span className="px-2.5 py-1 text-[10px] text-gray-600">
                                +{node.topics.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RoadmapNode;
