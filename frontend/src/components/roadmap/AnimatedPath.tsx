import React from 'react';
import { motion } from 'framer-motion';

// Simplified connector for the roadmap
export const RoadmapConnector: React.FC<{
    index: number;
    isCompleted: boolean;
    pathColor: string;
}> = ({ index, isCompleted, pathColor }) => {
    return (
        <div className="relative h-24 md:h-28 flex items-center justify-center">
            {/* Vertical Line Container */}
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full flex flex-col items-center justify-center">
                {/* Main Line */}
                <motion.div
                    className="w-0.5 h-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                        delay: index * 0.12 + 0.15,
                        duration: 0.6,
                        ease: 'easeOut',
                    }}
                    style={{
                        background: isCompleted
                            ? `linear-gradient(180deg, ${pathColor}80, ${pathColor}40)`
                            : `linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))`,
                        transformOrigin: 'top',
                    }}
                />

                {/* Dotted Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 4px,
              rgba(255,255,255,0.03) 4px,
              rgba(255,255,255,0.03) 8px
            )`,
                    }}
                />
            </div>

            {/* Traveling Particle for non-completed */}
            {!isCompleted && (
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                        background: pathColor,
                        boxShadow: `0 0 8px ${pathColor}, 0 0 16px ${pathColor}50`,
                    }}
                    animate={{
                        top: ['10%', '90%'],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'linear',
                        times: [0, 0.1, 0.9, 1],
                    }}
                />
            )}
        </div>
    );
};

// SVG Path version for more complex curves
export const AnimatedPath: React.FC<{
    startY: number;
    endY: number;
    isLeft: boolean;
    index: number;
    pathColor: string;
    isCompleted: boolean;
}> = ({ startY, endY, isLeft, index, pathColor, isCompleted }) => {
    const height = endY - startY;
    const curveOffset = isLeft ? 30 : -30;

    const path = `
    M 0 0
    C ${curveOffset} ${height * 0.25}, ${-curveOffset} ${height * 0.75}, 0 ${height}
  `;

    return (
        <svg
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: startY, height: height }}
            width="80"
            height={height}
            viewBox={`-40 0 80 ${height}`}
            fill="none"
            preserveAspectRatio="none"
        >
            {/* Background Path */}
            <path
                d={path}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
                strokeDasharray="6 6"
                fill="none"
            />

            {/* Animated Progress Path */}
            <motion.path
                d={path}
                stroke={pathColor}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                    pathLength: isCompleted ? 1 : 0,
                    opacity: isCompleted ? 0.6 : 0
                }}
                transition={{
                    delay: index * 0.15 + 0.3,
                    duration: 1,
                    ease: 'easeInOut',
                }}
            />
        </svg>
    );
};

export default AnimatedPath;
